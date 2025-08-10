source "https://rubygems.org"

# Gem de Jekyll
gem "jekyll", "~> 4.3"

# Tema por defecto para nuevos sitios Jekyll
gem "minima", "~> 2.5"

# Plugins de Jekyll
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-seo-tag", "~> 2.8"
end

# Dependencias para GitHub Pages
gem "github-pages", group: :jekyll_plugins

# Windows y JRuby no incluyen archivos zoneinfo, por lo que incluimos la gem tzinfo-data
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Mejora el rendimiento de watch en Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Bloquea la versión de http_parser.rb gem en versiones de JRuby
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]