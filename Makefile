SHELL = bash
NODE = $(shell which node)
NPM = $(shell which npm)
HR = node_modules/hr.js/bin/hr.js

.PHONY: all

all: build run

build:
	@echo ==== Build dashboard client ====
	$(HR) -d client build

	@echo
	@echo ==== Build client library ====
	browserify -r ./reportr.js -o ./public/api.js

	@echo
	@echo ==== Build chrome extension ====
	cd examples/javascript/chrome && sh ./build.sh
	@echo

install:
ifeq ($(NPM),)
	@echo -e "npm not found.\nInstall it from https://npmjs.org/"
	@exit 1
else
	$(NPM) install .
endif

deploy:
	@echo ==== Deploy to Heroku ====
	git push heroku master

run:
	@echo ==== Run server ====
	$(NODE) bin/web.js
