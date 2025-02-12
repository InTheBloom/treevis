from livereload import Server

server = Server()
server.watch("index.html")
server.watch("src/*")
server.serve(root = ".")
