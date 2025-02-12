from livereload import Server

server = Server()
server.watch("index.html", "src/*")
server.serve(root = ".")
