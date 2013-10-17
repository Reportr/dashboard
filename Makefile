SHELL = bash
NODE = $(shell which node)
NPM = $(shell which npm)
HR = node_modules/.bin/hr.js
FOREMAN = foreman
BROWSERIFY = node_modules/.bin/browserify

.PHONY: all

all: build clientlib run

build:
	@echo ==== Build dashboard client ====
	$(HR) -d client build
	@echo

install:
ifeq ($(NPM),)
	@echo -e "npm not found.\nInstall it from https://npmjs.org/"
	@exit 1
else
	$(NPM) install .
endif

clientlib:
	@echo ==== Build API library ====
	$(BROWSERIFY) -r ./reportr.js -o ./public/api.js
	@echo

chrome: clientlib
	@echo ==== Build chrome extension ====
	cp ./public/api.js ./thirdparty/javascript/chrome/src/reportr.js
	cd thirdparty/javascript/chrome && zip -ru ../../../chrome-extension.zip ./*
	@echo

deploy:
	@echo ==== Check Procfile ====
	$(FOREMAN) check

	@echo ==== Deploy to Heroku ====
	git push heroku master

run:
	@echo ==== Run application with foreman ====
	$(FOREMAN) start

runfree:
	@echo ==== Run application for free with foreman ====
	$(FOREMAN) start -f ./Procfile-free