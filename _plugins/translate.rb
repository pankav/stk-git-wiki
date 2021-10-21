require 'json'
require 'csv'
require 'poparser'

module STKWebsite
    class Translate < Liquid::Tag
        # Usage: {%translate Text to be translated%}
        # Usage: {%translate Text to be translated,Comment for translator%}
        # Usage: {%translate """Text"", with quotes and comma to be translated",Comment for translator%}
        def initialize(tag_name, variables, tokens)
            super
            data = CSV.parse(variables)
            @string = data[0][0]
            @comment = ''
            if data[0].length > 1 then
                @comment = data[0][1]
            end
            @js_translation = @string == 'Visit the main page'
        end
        def render(context)
            translation = ''
            # Only update translation source for english page
            lang = context['page']['lang']
            if lang == 'en' then
                pot_file = context['site'].data['po']['stk-website']
                exists = false
                pot_file.find_all do |entry|
                    if entry.msgid.str.match(@string) then
                        exists = true
                        break
                    end
                end
                if not exists
                    entry = { msgid: @string, msgstr: "" }
                    if @comment != '' then
                        entry[:translator_comment] = @comment
                    end
                    pot_file.add(entry)
                end
            else
                po = context['site'].data['po'][lang]
                if po then
                    strings = po.search_in(:msgid, @string)
                    if strings.length > 0 and strings[0].msgstr.to_s != '' then
                        translation = strings[0].msgstr.to_s
                    end
                end
            end
            translations = context['site'].data['js_translations']
            if @js_translation then
                if translations.include?(@string) then
                    if translation != '' then
                        translations[@string][lang] = translation
                    end
                else
                    translations[@string] = {}
                    if translation != '' then
                        translations[@string][lang] = translation
                    end
                end
            end
            if translation != '' then
                "#{translation}"
            else
                "#{@string}"
            end
        end
    end
    class TranslateSpan < Translate
        def initialize(tag_name, variables, tokens)
            super
            @js_translation = true
        end
        def render(context)
            "<span class=\"translate\">#{super}</span>"
        end
    end
end

Liquid::Template.register_tag('translate', STKWebsite::Translate)
Liquid::Template.register_tag('translate_span', STKWebsite::TranslateSpan)

Jekyll::Hooks.register :site, :post_render do |site|
    for page in site.pages do
    next if page.name != 'lang_redirect.js'
        page.output = 'var translations = ' +
            site.data['js_translations'].to_json + ";\n" + page.output
    end
    pot_file = site.data['po']['stk-website']
    pot_file.path = '_translations/stk-website.pot'
    pot_file.save_file
end
