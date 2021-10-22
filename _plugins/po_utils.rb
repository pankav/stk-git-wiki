require 'poparser'

module PoUtils
    def PoUtils::add_string_to_pot(pot_file, string, comment)
        current_entry = nil
        pot_file.find_all do |entry|
            if entry.msgid.str.match(string) then
                current_entry = entry
                break
            end
        end
        if not current_entry
            entry = { msgid: string, msgstr: "" }
            if comment != '' then
                entry[:translator_comment] = comment
            end
            pot_file.add(entry)
        elsif comment != '' and not current_entry.translator_comment then
            current_entry.translator_comment = comment
        end
    end
    def PoUtils::po_translate(po_file, string)
        if not po_file then
            return ''
        end
        strings = po_file.search_in(:msgid, string)
        if strings.length > 0 and strings[0].msgstr.to_s != '' then
            return strings[0].msgstr.to_s
        end
        return ''
    end
end
