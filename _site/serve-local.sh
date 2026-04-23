#!/bin/zsh

export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
export RUBYOPT="-r./_plugins/ruby4_compat.rb"

bundle exec jekyll serve "$@"
