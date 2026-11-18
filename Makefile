.PHONY: build dev-all dev-game dev-css dev-frontend dev-admin

TAILWIND = npx tailwindcss --postcss -c ./tailwind.config.js -i ./input.scss -o ./.css/output.css

build:
	NODE_ENV=production $(TAILWIND) --minify
	trunk build --public-url memory-game-rs

# All dev targets are long-running watchers, so run them in parallel
dev-all:
	$(MAKE) -j3 dev-css dev-frontend dev-admin

dev-game:
	$(MAKE) -j2 dev-css dev-frontend

dev-css:
	$(TAILWIND) -w

dev-frontend:
	trunk --config Trunk.dev.toml serve --port 8080

dev-admin:
	cd admin && pnpm run dev
