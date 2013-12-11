git commit -am "$1"
git push
docpad generate
cd out
git add *
git commit -am "$1"
git push -f origin master

