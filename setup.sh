#!/bin/sh


# ERROR CODES:
# 4     ->  dependencies
# 8     ->  database
# 16    ->  build
# 32    ->  start glassfish
# 64    ->  deploy
#



must_check=1 # no

# parameters
while getopts "ch" optname; do
    case "$optname" in
        "c")
            must_check=0 # yes
        ;;
        
        "h" | \?)
           printf "Install QgeneS: setup the db, build the code, runs the servers and deploy the software. \n\n"
           echo "Usage:"
           echo "   -h        Display this help message."
           echo "   -c        Force the check of dependencies."
           exit 0
        ;;
    esac
done
  
  

echo "=========================="
echo "          QgeneS"
echo "=========================="

printf "\nStarting setup...\n"



# -------------------- CHECKING DEPENDENCIES

# --- functions

where_is () {
    whereis -b $1 | tr " " "\n" | sed 's/$1://' | sort -r | tr " " "\n" | head -n 1
}

simplify_sw_version() {
    echo $1 | sed 's/\.//g' | cut -c 1-2
}

check_dependence() {
    # parameters:
    #   1. dependence name
    #   2. path
    #   3. version
    #   4. min. version
    #   5. max. version
    
    simple_installed_version=$(simplify_sw_version $3)
    simple_min_version=$(simplify_sw_version $4)
    
   
    if [ $2 ]; then
        echo "    - $1 => $2 ($3)"
       
        if [ $4 ]; then
            if test $simple_installed_version -lt $simple_min_version; then
                printf "\n      WARNING: required $1 >= $4\n    Exiting...\n"
                exit 4
            fi
        fi
    
        if [ $5 ]; then
            if test $simple_installed_version -gt $simple_min_version; then
                printf "\n      WARNING: required $1 <= $5\n      QGENES MAY NOT WORK PROPERLY.\n\n"
            fi
        fi
    else
        echo "      ERROR: $1 not found. Please check your $1 installation and retry. \nExiting...\n"
        exit 4
    fi
}


# --- logic


java_path=$(which java)
java_version=$(java -version 2>&1 | head -n 1 | sed -r 's/\S+ version "(\S+)"/\1/')
java_min_version="1.7.0"

neo4j_path=$(where_is "neo4j")
neo4j_version=$(echo $neo4j_path | sed -r 's/(\S+)\/neo4j-(\w+)-(\S+)\/bin\/neo4j/\3/g')
neo4j_min_version="2.2.0"
neo4j_max_version="3.2"

glassfish_path=$(locate -l 1 glassfish4)
glassfish_version=$($glassfish_path/bin/asadmin version | grep "^Version =" | grep -Eo [0-9\.]{2}+[0-9])
glassfish_min_version="4.0.0"

maven_path=$(where_is "maven")
maven_version=$(mvn -v | head -n 1 | sed -r 's/.* (\d\.\d\.\d)*/\1/')
maven_min_version="3.0.0"

git_path=$(which git)
git_version=$(git --version | sed -r 's/.* (\d\.\d\.\d)*/\1/')
#git_min_version


# --- functions

check_dependencies() {
    printf "\nChecking dependencies...\n"

    check_dependence "java" $java_path $java_version $java_min_version
    check_dependence "neo4j" $neo4j_path $neo4j_version $neo4j_min_version $neo4j_max_version
    check_dependence "glassfish" $glassfish_path $glassfish_version $glassfish_min_version
    check_dependence "maven" $maven_path $maven_version $maven_min_version
    check_dependence "git" $git_path $git_version
}

# --- logic

if [ $must_check -eq 0 ]; then
    check_dependencies
fi

# -------------------- OPERATIONS

# --------- DATABASE

# --- functions


question() {

rep=""
    
while [ "$rep" = "" ] && [ "$rep" != "n" ] && [ "$rep" != "y" ]; do
    printf "\n> $1? [y/n]:  "
    read rep
done

if [ $rep = "y" ]; then
    return 0 # true
else
    return 1
fi
  
}


download_datasets() {
    
    clone_done=0
              
    printf "\n"
    
    git clone https://gitlab.com/mattux/qgenes_datasets.git && clone_done=1
    
    if test $clone_done -eq 0; then
        printf "\nERROR: Dataset downloading failed. Check your internet connection, please.\nExiting...\n"
        exit 8
    fi
}



destination_dir=""
database_already_exist=0 #does exist

if ! question "Do you already have created the QgeneS database"; then
    database_already_exist=1
    
    if question "Do you already have downloaded the QgeneS datasets"; then
        while [ "$destination_dir" = "" ]; do    
            printf "Insert the path where the datasets are located:  "
            read destination_dir
        done
    
    else
        destination_dir=$(pwd)/qgenes_datasets/
        download_datasets
    fi
fi


# --- logic

printf "\n\n##### DATABASE\n"

neo4j_basepath=$(dirname $neo4j_path | sed 's/bin//g')

genes_dataset_path=$destination_dir/neo4j_genes.csv
rels_dataset_path=$destination_dir/neo4j_rels.csv
    

# starting from here ROOT PERMISSIONS NEEDED
    
printf "\nTrying to stop running possibly Neo4j instances...\n"
$neo4j_path stop

# db doesn't exist
if [ $database_already_exist -eq 1 ]; then
    printf "\nCreating the Neo4j database from the datasets...\n"

    $neo4j_basepath/bin/neo4j-import --into $neo4j_basepath/data/databases/qgenes.db --database qgenes.db --nodes $genes_dataset_path --relationships $rels_dataset_path --delimiter "|" --array-delimiter ";"
fi


# setting neo4j.conf anyway...
printf "\nSetting the qenes database as the active Neo4j database..."
sed -r -i.bak 's/^#?(dbms.active_database)=(\S+)/\1=qgenes.db/g' $neo4j_basepath/conf/neo4j.conf

printf "\nDisabling the Neo4j auth... (it's required by QgeneS to work properly)"
sed -r -i.bak 's/(dbms.security.auth_enabled)=(\w+)/\1=false/g' $neo4j_basepath/conf/neo4j.conf

printf "\nStarting Neo4j...\n"
$neo4j_path start



# --------- QGENES

# --- functions

build_qgenes() {
    mvn_output=$(mvn package)
    mvn_fail=$(echo "$mvn_output" | grep -oi 'build failure')
    
    printf "$mvn_output\n"
    
    if test "$mvn_fail" != ""; then
        printf "\nERROR: Build failed.\nExiting...\n"
        exit 16
    fi
}


# --- logic

printf "\n\n##### QGENES\n"
printf "\nBuilding QgeneS' source code...\n"

cd qgenes

build_qgenes

cd ..



# --------- GLASSFISH

glassfish_result=""
deploy_result=""

# --- functions

start_glassfish() {
    $glassfish_path/bin/asadmin restart-domain domain1
}


deploy_qgenes() {
    # 1. .war file path
    
    deploy_result=$($glassfish_path/bin/asadmin deploy --name qgenes $1 2>&1)
    #printf "$deploy_result"
    
    deploy_failure=$(echo "$deploy_result" | grep -oi 'already registered')
    
    if [ "$deploy_failure" != "" ]; then
        $glassfish_path/bin/asadmin redeploy --name qgenes $1 2>&1
    fi
}


is_successful() {
    if [ "$(echo $1 | grep -oi 'successfully') = "successfully"" ]; then
        return 0
    else
        return 1
    fi
}


# --- logic

printf "\nBuilding done.\n\n(Re)Starting Glassfish...\n"

glassfish_start_result=$(start_glassfish 2>&1)

printf $glassfish_start_result

if is_successful "$glassfish_start_result"; then
    printf "\n(Re)Deploying QgeneS...\n"

    deploy_result=$(deploy_qgenes qgenes/target/qgenes.war)

    printf "$deploy_result"
     
    if is_successful "$deploy_result"; then
        printf "\n\nIf nothing gone wrong, we have finished!\n"
        printf "\nNow go to http://localhost:8080/qgenes/ with a browser and have fun! Thank you!\n"

    else
        printf "\nERROR: the deploying gone wrong. Check the Glassfish log file.\nExiting...\n"
        exit 64
    fi
else
    printf "\nERROR: server doesn't start. Check the Glassfish log file.\nExiting...\n"
    exit 32
    
fi


# --------- FINISH!

exit 0
