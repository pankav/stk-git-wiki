var translations = {"Menu":{"pl":"Menu","zh_CN":"菜单","zh_TW":"目錄"},"Discover":{"pl":"Odkryj","zh_CN":"探索","zh_TW":"探索"},"Download":{"pl":"Pobierz","zh_CN":"下载","zh_TW":"下載"},"FAQ":{"pl":"FAQ","zh_CN":"常问问题","zh_TW":"常見問題解答"},"Get Involved":{"pl":"Zaangażuj się","zh_CN":"参与","zh_TW":"參與"},"Blog":{"pl":"Blog","zh_CN":"博客","zh_TW":"網誌"},"Donate":{"pl":"Darowizny","zh_CN":"捐赠","zh_TW":"捐贈"},"Visit the main page":{"pl":"Przejdź na stronę główną","zh_CN":"访问主页","zh_TW":"訪問主頁"},"Community":{"pl":"Społeczność","zh_CN":"社区","zh_TW":"社區"},"Forum":{"pl":"Forum","zh_CN":"论坛","zh_TW":"論壇"},"Twitter":{"pl":"Twitter","zh_CN":"推特","zh_TW":"Twitter"},"Addons":{"pl":"Dodatki","zh_CN":"附加组件","zh_TW":"附加元件"},"Telegram":{"pl":"Telegram","zh_CN":"Telegram","zh_TW":"Telegram"},"Media":{"pl":"Multimedia","zh_CN":"媒体","zh_TW":"媒體"},"YouTube":{"pl":"YouTube","zh_CN":"YouTube","zh_TW":"YouTube"},"Gallery":{"pl":"Galeria","zh_CN":"画廊","zh_TW":"畫廊"},"Posters":{"pl":"Plakaty","zh_CN":"海报","zh_TW":"海報"},"Development":{"pl":"Rozwój","zh_CN":"开发","zh_TW":"開發"},"Modding":{"pl":"Modowanie","zh_CN":"改装","zh_TW":"改裝"},"GitHub":{"pl":"GitHub","zh_CN":"GitHub","zh_TW":"GitHub"},"Documentation":{"pl":"Dokumentacja","zh_CN":"文件","zh_TW":"文件"},"About us":{"pl":"O nas","zh_CN":"关于我们","zh_TW":"關於我們"},"About the team":{"pl":"Zespół gry SuperTuxKart","zh_CN":"关于团队","zh_TW":"關於團隊"},"About SuperTuxKart":{"pl":"O grze SuperTuxKart","zh_CN":"关于 SuperTuxKart","zh_TW":"關於 SuperTuxKart"},"Projects using SuperTuxKart":{"pl":"Projekty używające gry SuperTuxKart","zh_CN":"使用 SuperTuxkart 的项目","zh_TW":"使用 SuperTuxKart 的項目"}};
// var translations will be added by _plugins/translate.rb
var supported_languages = ["pl","zh_CN","zh_TW"];
var link_translations = {'https://benau.github.io/stk-git-wiki/Discover' : ['pl','zh_CN','zh_TW',],'https://benau.github.io/stk-git-wiki/Donate' : [],'https://benau.github.io/stk-git-wiki/Donation_Policy' : [],'https://benau.github.io/stk-git-wiki/Main_Page' : ['pl','zh_CN','zh_TW',],};

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
var site_url = 'https://benau.github.io' + '/stk-git-wiki' + '/';
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
        var logo_text = logo.getAttribute('title');
        if (translations[logo_text] && translations[logo_text][preferred_lang])
            logo.setAttribute('title', translations[logo_text][preferred_lang]);
        var elements = document.getElementsByClassName("translate");
        for (var i = 0; i < elements.length; i++)
        {
            var element_text = elements[i].textContent;
            if (translations[element_text] &&
                translations[element_text][preferred_lang])
                elements[i].textContent = translations[element_text][preferred_lang];
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
