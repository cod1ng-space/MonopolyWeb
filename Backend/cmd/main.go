package main

import (
	"monopoly-server/internal/api"
	"monopoly-server/internal/provider"
	"monopoly-server/internal/usecase"

	_ "github.com/lib/pq"
)

func main() {

	prv := provider.NewProvider("localhost", 5432, "postgres", "postgre", "monopoly_db")
	use := usecase.NewUsecase(prv)
	srv := api.NewServer("127.0.0.1", 8080, 32, use)

	srv.Run()
}
