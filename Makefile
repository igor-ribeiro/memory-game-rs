.PHONY: dev-app dev-admin

dev-all: dev-app dev-admin

dev-app: dev-css dev-app

dev-css:
	bonnie run tailwind

dev-app:
	bonnie run frontend
	
dev-admin:
	cd admin && pnpm run dev
