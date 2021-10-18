---
layout: null
---
{%- assign supported_languages = '' | split: ',' -%}
{%- for translation in site.data.translations -%}
    {%- if translation[0] != 'en' -%}
        {%- assign supported_languages = supported_languages | push: translation[0] -%}
    {%- endif -%}
{%- endfor %}
var supported_languages = {{ supported_languages | jsonify }};
{% assign link_translations = "" | split: ',' %}
{%- assign full_url =  site.url | append: site.baseurl -%}
{%- for post in site.pages -%}
    {%- if post.lang == 'en' -%}
        {%- assign link = full_url | append: post.url -%}
        {%- assign link_translations = link_translations | push: link -%}
    {%- endif -%}
{%- endfor -%}
var link_translations = {
{%- for link in link_translations -%}
    '{{- link -}}' : [
    {%- for post in site.pages -%}
        {%- if supported_languages contains post.lang -%}
            {%- assign substr = post.url | split: '/' -%}
            {%- assign orig_url = full_url | append: '/' | append: substr[2] -%}
            {%- if link ==  orig_url -%}
                '{{- post.lang -}}',
            {%- endif -%}
        {%- endif -%}
    {%- endfor -%}
    ],
{%- endfor -%}
};
var translations = {{ site.data.translations | jsonify }};

function getSuitableLang(lang, locale)
{
    // Special handling for possible tranditional chinese locales to avoid
    // displaying simplified chinese for those users
    if (lang == 'zh')
    {
        if (locale.search('hk') != -1 || locale.search('mo') != -1 ||
            locale.search('tw') != -1 || locale.search('hant') != -1)
            locale = 'TW';
        else
            locale = 'CN';
    }
    locale = locale.toUpperCase();
    for (var i = 0; i < supported_languages.length; i++)
    {
        var lang_locale = lang + '_' + locale;
        if (supported_languages[i] == lang_locale)
            return supported_languages[i];
    }
    for (var i = 0; i < supported_languages.length; i++)
    {
        var lang_only = supported_languages[i].split('_')[0]
        if (lang_only == lang)
            return supported_languages[i];
    }
    return null;
}

var preferred_lang = document.documentElement.lang.replace("-", "_");
var site_url = '{{ site.url }}' + '{{ site.baseurl }}' + '/';
try
{
    // Prevent error when cookies disabled
    if (!sessionStorage.getItem('preferred_lang'))
    {
        sessionStorage.setItem('preferred_lang', 'en');

        var user_language = (((navigator.userLanguage || navigator.language).replace('-', '_')).toLowerCase()).split('_');
        var lang = user_language[0];
        var locale = '';
        if (user_language.length > 1)
            locale = user_language[1];
        var suitable_lang = getSuitableLang(lang, locale)
        if (suitable_lang != null)
            sessionStorage.setItem('preferred_lang', suitable_lang);
    }

    // Override preferred language if language tag is supplied in url
    // or the referrer
    var all_lang = supported_languages;
    all_lang.push('en');
    for (var i = 0; i < all_lang.length; i++)
    {
        var site_url_lang = site_url + all_lang[i];
        if (window.location.href.search(site_url_lang) != -1)
        {
            sessionStorage.setItem('preferred_lang', all_lang[i]);
            break;
        }
        else if (document.referrer.search(site_url_lang) != -1)
        {
            sessionStorage.setItem('preferred_lang', all_lang[i]);
            break;
        }
    }
    preferred_lang = sessionStorage.getItem('preferred_lang');
} catch (error) {}

var doc_lang = document.documentElement.lang.replace("-", "_");
if (doc_lang == 'en' && doc_lang != preferred_lang)
{
    // Only redirect if page translation exists, other translate the layout
    // texts and links
    var page = window.location.href.substring(site_url.length).split("/").pop();
    var success = false;
    var arr = link_translations[site_url + page];
    if (arr != null)
    {
        for (var i = 0; i < arr.length; i++)
        {
            if (preferred_lang == arr[i])
            {
                window.location.replace(site_url + preferred_lang + '/' + page);
                success = true;
                break;
            }
        }
    }
    if (!success && doc_lang == 'en')
    {
        var logo = document.getElementsByClassName('logo noselect')[0];
        var logo_translated = false;
        var elements = document.getElementsByClassName("translate");
        var en_strings = translations.en.en;
        for (var i = 0; i < elements.length; i++)
        {
            for (var key in en_strings)
            {
                var translation = translations[preferred_lang][preferred_lang][key];
                if (!logo_translated && logo.getAttribute('title') == en_strings[key])
                {
                    logo_translated = true;
                    if (translation != null)
                        logo.setAttribute('title', translation);
                }
                else if (elements[i].textContent == en_strings[key])
                {
                    if (translation != null)
                        elements[i].textContent = translation;
                }
            }
        }
        var links = document.links;
        for (var i = 0; i < links.length; i++)
        {
            var arr = link_translations[links[i].href];
            if (arr == null)
                 continue;
            for (var j = 0; j < arr.length; j++)
            {
                if (preferred_lang == arr[j])
                {
                    var page = links[i].href.split("/").pop();
                    links[i].href = site_url + preferred_lang + '/' + page;
                    break;
                }
            }
        }
    }
}
