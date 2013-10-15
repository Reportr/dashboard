SHELL = bash
NODE = $(shell which node)
NPM = $(shell which npm)
HR = node_modules/.bin/hr.js
FOREMAN = foreman
BROWSERIFY = node_modules/.bin/browserify

.PHONY: all

all: build run

build:
	@echo ==== Build dashboard client ====
	$(HR) -d client build
	@echo
	@echo ==== Build API library ====
	$(BROWSERIFY) -r ./reportr.js -o ./public/api.js
	@echo

install:
ifeq ($(NPM),)
	@echo -e "npm not found.\nInstall it from https://npmjs.org/"
	@exit 1
else
	$(NPM) install .
endif

chrome: clientlibrary
	@echo ==== Build chrome extension ====
	cp ./public/api.js ./examples/javascript/chrome/src/reportr.js
	cd examples/javascript/chrome && zip -ru ../../../chrome-extension.zip ./*
	@echo

deploy:
	@echo ==== Check Procfile ====
	$(FOREMAN) check

	@echo ==== Deploy to Heroku ====
	git push heroku master

run:
	@echo ==== Run application with foreman ====
	$(FOREMAN) run
