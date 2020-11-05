PACKAGE =   cardStatis

#------------------------------------------build,run-------------------------------------

run: bin/$(PACKAGE)
	bin/$(PACKAGE) dev

debug: bin/$(PACKAGE)
	bin/$(PACKAGE) -db dev -ss true

build: bin/$(PACKAGE)

bin/$(PACKAGE):
	cd card_statis && go build -o ../bin/$(PACKAGE) 

clean:
	rm bin/*