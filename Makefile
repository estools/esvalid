default: build
all: build lint test

ESLINT = node_modules/.bin/eslint
ISTANBUL = node_modules/.bin/istanbul
MOCHA = node_modules/.bin/_mocha
MOCHA_OPTS = --inline-diffs --check-leaks -u tdd -R dot
XYZ = node_modules/.bin/xyz --repo git@github.com:michaelficarra/esvalid.git

build:
	# nothing to build yet

.PHONY: default all build release-major release-minor release-patch test lint clean
release-major: lint test
	$(XYZ) --increment major
release-minor: lint test
	$(XYZ) --increment minor
release-patch: lint test
	$(XYZ) --increment patch

test: build
	$(ISTANBUL) cover $(MOCHA) -- $(MOCHA_OPTS) -- test/*.js

lint: build
	$(ESLINT) -- index.js test/*.js

clean:
	rm -rf lib
