.PHONY: dev-all dev-app dev-css dev-frontend dev-admin

# All targets are long-running watchers, so run them in parallel
dev-all:
	$(MAKE) -j3 dev-css dev-frontend dev-admin

dev-app:
	$(MAKE) -j2 dev-css dev-frontend

dev-css:
	bonnie run tailwind

dev-frontend:
	bonnie run frontend

dev-admin:
	cd admin && pnpm run dev
