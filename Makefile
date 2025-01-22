target:
	make -j run-frontend run-backend
run-frontend:
	cd Frontend && bun run dev
run-backend:
	cd Backend && go run ./cmd/main.go
init-project:
	cd Frontend && bun install
