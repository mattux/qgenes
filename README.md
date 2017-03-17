# QgeneS
QgeneS (Query genes Similarity) is a tool that lets you search for semantic relationships between genes. The result is shown as an interactive network.


## Getting ready (on a Linux machine)

### Requires:
- Java JDK (Oracle or OpenJDK), min. 1.7
- Maven
- Glassfish
- Neo4j (from 2.2 to the latest [3.1, currently])

### 1) Download the source code
    $ git clone https://github.com/mattux/qgenes.git

### 2) Install Java JDK
The [OpenJDK](http://openjdk.java.net/) package inside the repositories of your distribution should be OK. Otherwise, [here](http://www.oracle.com/technetwork/java/javase/downloads/index.html) you can find Java SE.

### 3) Install Neo4j
Get it from [http://neo4j.com/download/](https://neo4j.com/download/).

Extract in a directory of your choice (e.g. `/opt/`).

**Note**: QgeneS assumes that:
- the database server URL is `localhost:7474` (is the default configuration)
- the authentication is disabled; to disable it:
    - open `/opt/neo4j-community-{YOUR_VERSION}/conf/neo4j.conf`
    - change the line `dbms.security.auth_enabled=true` in `dbms.security.auth_enabled=false`

### 3) Install Glassfish
Download it ([http://glassfish.java.net/download.html](https://glassfish.java.net/download.html)) and extract the archive in a directory (e.g. `/opt/`).

### 4) Install Maven
If it is not present in your distribution's repo, take it from here: [http://maven.apache.org/download.html](https://maven.apache.org/download.html)

And here [how to install manually](https://maven.apache.org/download.html).

## Build and run (on a Linux machine)
#### Populate and run the database

Download the datasets from here: [https://gitlab.com/mattux/qgenes_datasets/tree/master](https://gitlab.com/mattux/qgenes_datasets/tree/master).

Populate the db (check your neo4j version):

    # /opt/neo4j-community-{YOUR_VERSION}/bin/neo4j-import --into {DESTINATION} --nodes "{PATH_OF_GENES_DATASET}" --relationships "{PATH_OF_SIMILARITIES_DATASET}" --delimiter "|" --array-delimiter ";"

Launch Neo4j:

    # /opt/neo4j-community-{YOUR_VERSION}/bin/neo4j start


#### Build the source code

Assuming the code has been cloned in the home directory:

    $ cd ~/qgenes/qgenes/
    $ mvn package


#### Deploy and run the application server
Assuming _Glassfish_ is located in `/opt`:

    # /opt/glassfish4/bin/asadmin start-domain
    # /opt/glassfish4/bin/asadmin deploy --name qgenes /home/{USER}/qgenes/qgenes/target/qgenes.war


In the browser, go to:

    http://localhost:8080/qgenes/


