import os
from django.http import HttpResponse
from neo4jrestclient.client import GraphDatabase
from py2neo import authenticate, Graph

from py2neo.packages.httpstream import http
http.socket_timeout = 9999

DBHost = os.environ.get("DB_CONNECTIONSTRING")

authenticate(DBHost + ":7474", "neo4j", "password")
graph = Graph(host=DBHost, user="neo4j", password="password", bolt=False)
tx = graph.run("MATCH (n) RETURN count(*)")
nodeCount = tx.evaluate()

url = "http://" + DBHost + ":7474/db/data"
gdb = GraphDatabase(url, username="neo4j", password="password")

def index(request):

        string = "<h1> Neo4j Data </h1> <br/>"

        for i in range(0, nodeCount-1):
                node = gdb.node[i].properties
                for key, value in node.items():
                        if type(key) is int:
                                string = string + "<b>" + str(key)
                        else:
                                string = string + "<b>" + key.encode('utf-8')
                        string = string + " - </b>"
                        if type(value) is int:
                                string = string + str(value)
                        else:
                                string = string + value.encode('utf-8')
                        string = string + "<br/>"
                string = string + "<br/>"

        return HttpResponse(string)

print( "end of script" )
