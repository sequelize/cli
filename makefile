build:
	npm run build

info:
	@echo "INFO" && \
	lib/sequelize db:info

fail:
	@echo "FAIL" && \
	NODE_ENV=nope lib/sequelize db:info

raw:
	@echo "RAW" && lib/sequelize db:info --raw

show:
	@echo "PWD" && lib/sequelize db:info --show-password

env:
	@echo "ENV" && NODE_ENV=env lib/sequelize db:info

env-pass:
	@echo "ENV" && NODE_ENV=env lib/sequelize db:info --show-password

run: build show
	@echo "----\n"

loop:
	while inotifywait -q -e modify src/**; \
		do clear; make run; done;

