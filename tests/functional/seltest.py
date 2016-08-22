# -*- coding: utf-8 -*-

from selenium.common.exceptions import WebDriverException
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
import time
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common import exceptions
from sbase import NimbusSeleniumBaseTestCase
from attachment import AttachmentBaseTest
import json


class TestUi(NimbusSeleniumBaseTestCase, AttachmentBaseTest):

    @staticmethod
    def move_to(element, driver):
        m_over = ActionChains(driver).move_to_element(element)
        m_over.perform()

    @staticmethod
    def _get_folder_id_by_object(folder_object):
        parent_folder = folder_object.find_element_by_xpath('..')
        return parent_folder.get_attribute("id")

    def setUp(self):
        self.driver.implicitly_wait(100)
        time.sleep(3)

    def _default_state(self):
        self.driver.get(self.url)
        time.sleep(6)
        my_notes_menu_item = self.driver.find_element_by_css_selector("li#default")
        ActionChains(self.driver).move_to_element(my_notes_menu_item)
        time.sleep(1)
        my_notes_menu_item.click()
        time.sleep(4)

    def _substract_px(self, data_to_format):
        data_to_format = int(data_to_format[:-2])
        return data_to_format
    
    def _select_folder_by_name(self, name):
        return self.driver.find_element_by_css_selector(".folder_short.ng-binding[title='" + name + "']")

    def _get_shared_link(self):
        note_text = u"Some text"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(2)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            global_id = self._get_random_name(16),
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        note_id = note_data["global_id"]
        attach_fname = '114-1024.JPG'
        fixture_file = self.check_fixture_file(attach_fname)

        attach = self._do_attachment_upload(fixture_file=fixture_file,
                                            note_id=note_id, in_list= True)
        time.sleep(2)
        folder.click()
        self.driver.refresh()
        time.sleep(2)

        share_unshare_button = self.driver.find_element_by_css_selector(".head_note a.share")
        self.assertIsNotNone(share_unshare_button)
        time.sleep(2)
        share_unshare_button.click()
        time.sleep(5)
        link = self.driver.find_element_by_css_selector(".share_url .url_password")
        link_text = link.get_attribute("value")
        ok = self.driver.find_element_by_css_selector(".title_password .remove_select")
        ok.click()
        self.driver.get(link_text)
        return attach_fname

    def _create_note_without_ui(self, title=None, text=None, parent_id=None, global_id=None):
        note_data = {
            'type': 'note',
            'url': 'https://www.google.com.ua/'
        }
        if global_id:
            note_data["global_id"] = global_id
        if text:
            note_data["text"] = text
        if title:
            note_data["title"] = title
        if parent_id:
            note_data["parent_id"] = parent_id
        post_data = {
            'action': 'notes:update',
            'body': {
                'store': {
                    'notes': [note_data]
                }
            }
        }
        return self._do_request(data=post_data)

    def _create_folder_without_ui(self, name):
        note_data = {
            'index': 0,
            'type': 'folder',
            'title': name
        }

        post_data = {
            'action': 'notes:update',
            'body': {
                'store': {
                    'notes': [note_data]
                }
            }
        }

        return self._do_request(data=post_data)

    def _get_notes_with_text(self, note_id):
        post_data = {
            'action': 'notes:get',
            'body': {
                'global_id': note_id
            }
        }
        return self._do_request(data=post_data)

    def _remove_item_without_ui(self, note_id):
        post_data = {
            'action': 'notes:update',
            'body': {
                'remove': {
                    'notes': [note_id]
                }
            }
        }

        return self._do_request(data=post_data)

    def _context_click(self, element):
        ActionChains(self.driver).context_click(element).perform()
        time.sleep(2)
        ActionChains(self.driver).context_click(element).perform()

    def _select_folder_by_name(self, name):
        return self.driver.find_element_by_css_selector(".folder_short.ng-binding[title='" + name + "']")

    def _create_folder(self, name):
        name = name if name else "not_set"
        my_notes_menu_item = self.driver.find_element_by_css_selector("li#default")
        ActionChains(self.driver).move_to_element(my_notes_menu_item)
        time.sleep(4)
        my_notes_menu_item.click()
        time.sleep(4)
        add_folder_button = WebDriverWait(self.driver, 5).until(
            lambda x: x.find_element_by_css_selector("a.add_folder"))
        add_folder_button.click()

        text = self.driver.find_element_by_css_selector(".my_class")
        text.clear()
        text.send_keys(name)
        self.driver.find_element_by_id("create_folder").click()
        my_new_folder = self.driver.find_element_by_css_selector(".folder_short.ng-binding[title='" + name + "']")
        return my_new_folder

    def _create_new_note_in_current_folder(self):
        time.sleep(2)
        button_create_note = self.driver.find_element_by_css_selector(".btn-wrapper button.btn.blue")
        button_create_note.click()
        time.sleep(2)

    def _set_text_to_current_note(self, text):
        editor_frame = self.driver.find_element_by_css_selector("#notes_text_ifr")
        self.driver.switch_to_frame(editor_frame)
        body = self.driver.find_element_by_css_selector("body")
        body.send_keys(text)
        self.driver.switch_to_default_content()

    def _del_folder_without_ui(self, id):
        notes_ids = [id]
        post_data = {
            'action': 'notes:update',
            'body': {
                'remove': {
                    'notes': notes_ids
                }
            }
        }

        return self._do_request(data=post_data)

    def _get_note_url_without_ui(self, id):
        post_data = {
            'action': 'notes:share',
            'body': {
                'toggle': {
                    'notes': [id]
                }
            }
        }
        return self._do_request(data=post_data)

    def _click_new_note(self):
        new_note = self.driver.find_element_by_css_selector(".btn-wrapper button")
        return new_note

    def _get_selectInFull(self):
        save = self.driver.find_element_by_css_selector("#save_change_main")
        save.click()
        time.sleep(7)
        self.driver.refresh()
        time.sleep(10)
        f_note = self.driver.find_element_by_css_selector(".notes_list li:first-child")
        time.sleep(2)
        ActionChains(self.driver).click(f_note).perform()
        time.sleep(2)
        edit = self.driver.find_element_by_css_selector(".edit")
        edit.click()
        selectinfull = self.driver.find_element_by_css_selector(".tag_line .tag_line_search form .chzn-choices li:nth-child(1) span")
        return selectinfull

    def test_hidding_left_block_scroll(self):
        left_block = self.driver.find_element_by_css_selector('.jspPane')
        left_block_width = left_block.value_of_css_property('width')
        self.driver.set_script_timeout(15)
        horizont_scroll = self.driver.find_element_by_css_selector('.jspContainer')
        horizont_scroll_width = horizont_scroll.value_of_css_property('width')
        self.assertEqual(self._substract_px(left_block_width), 207, 'left block width is too big')
        self.assertEqual(self._substract_px(horizont_scroll_width), 207,
                         'horizont scroll width of left bloc is too big')
    
    def test_share_unshare_item(self):
        my_notes_menu_item = self.driver.find_element_by_css_selector("li#default")

        my_notes_menu_item.click()
        self.driver.implicitly_wait(500)
        button_click_on_first_button = self.driver.find_element_by_css_selector(".notes_list li:first-child")
        button_click_on_first_button.click()

        self.driver.implicitly_wait(1500)
        share_unshare_button = self.driver.find_element_by_css_selector(".head_note a.share")

        self.assertIsNotNone(share_unshare_button)

        share_unshare_button.click()
        self.driver.implicitly_wait(1500)
        share_button = self.driver.find_element_by_css_selector(".title_password .remove_select")
        self.assertIsNotNone(share_button)

        share_button.click()
        self.driver.implicitly_wait(500)
        share_unshare_button = self.driver.find_element_by_css_selector(".head_note a.share")
        self.assertIsNotNone(share_unshare_button)

        share_unshare_button.click()

        unshare_button = self.driver.find_element_by_css_selector(".unshare_note")
        self.assertIsNotNone(unshare_button)

        unshare_button.click()
        self.driver.refresh()
    
    def test_share_button_color(self):
        note_text = u"Some text"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(2)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            global_id = self._get_random_name(16),
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()
        self.driver.refresh()
        time.sleep(5)

        share_unshare_button = self.driver.find_element_by_css_selector(".head_note a.share")
        self.assertIsNotNone(share_unshare_button)
        share_unshare_button.click()
        time.sleep(5)
        share_button = self.driver.find_element_by_css_selector(".title_password .remove_select")
        self.assertIsNotNone(share_button)
        share_button.click()
        self.driver.implicitly_wait(500)

        share_unshare_button = self.driver.find_element_by_css_selector(".head_note a.share.active")
        self.assertTrue(share_unshare_button.is_displayed())
        self.driver.implicitly_wait(500)
        share_unshare_button = self.driver.find_element_by_css_selector(".head_note a.share")
        self.assertIsNotNone(share_unshare_button)
        share_unshare_button.click()

        self.driver.implicitly_wait(1000)
        unshare_button = self.driver.find_element_by_css_selector(".unshare_note")
        self.assertIsNotNone(unshare_button)

        unshare_button.click()
        self.assertRaises(
            (exceptions.NoSuchElementException, WebDriverException),
            self.driver.find_element_by_css_selector,
            (".head_note a.share", )
        )
        self._del_folder_without_ui(folder_data["global_id"])

    def test_checking_padding_short_text_container(self):
        my_notes_menu_item = self.driver.find_element_by_css_selector("li#default")
        ActionChains(self.driver).move_to_element(my_notes_menu_item)
        time.sleep(2)
        my_notes_menu_item.click()
        time.sleep(2)
        noteItemElement = self.driver.find_element_by_css_selector(".notes_list li:first-child")
        self.assertIsNotNone(noteItemElement)
        noteItemPaddingRight = noteItemElement.value_of_css_property('padding-right')
        self.assertLess(19, self._substract_px(noteItemPaddingRight), 'Option padding-right is too small');

    def test_focus_textarea_when_create_folder(self):
        folder_name = self._get_random_name(12)
        my_notes_menu_item = self.driver.find_element_by_css_selector("li#default")
        ActionChains(self.driver).move_to_element(my_notes_menu_item)
        time.sleep(2)
        my_notes_menu_item.click()
        time.sleep(2)
        add_folder_button = self.driver.find_element_by_css_selector("a.add_folder")
        time.sleep(2)
        add_folder_button.click()
        time.sleep(2)

        active_textarea = self.driver.find_element_by_css_selector('.my_class')
        active_element = self.driver.switch_to_active_element()

        self.assertEqual(active_element, active_textarea)
        cansel_button = self.driver.find_element_by_css_selector('.modal-footer button:last-child')
        cansel_button.click()

    def test_click_enter_in_create_folder_popup(self):
        folder_name = self._get_random_name(12)
        my_notes_menu_item = self.driver.find_element_by_css_selector("li#default")
        ActionChains(self.driver).move_to_element(my_notes_menu_item)
        time.sleep(2)
        my_notes_menu_item.click()
        time.sleep(2)
        add_folder_button = self.driver.find_element_by_css_selector("a.add_folder")
        time.sleep(2)
        add_folder_button.click()
        time.sleep(2)

        active_textarea = self.driver.find_element_by_css_selector('.my_class')
        time.sleep(2)
        ActionChains(self.driver).send_keys_to_element(active_textarea, Keys.CONTROL + "a").perform()
        time.sleep(2)
        active_textarea.send_keys(folder_name)
        time.sleep(5)
        ActionChains(self.driver).send_keys_to_element(active_textarea, Keys.ENTER).perform()
        time.sleep(4)
        my_new_folder = self.driver.find_element_by_css_selector(
            ".folder_short.ng-binding[title='" + folder_name + "']")
        time.sleep(2)

        self.assertIsNotNone(my_new_folder)
        id = self._get_folder_id_by_object(my_new_folder)
        self._del_folder_without_ui(id)

    def test_check_favicon(self):
        my_favicon_a = self.driver.find_element_by_css_selector("link[rel=icon]")
        my_favicon_b = self.driver.find_element_by_css_selector("link[rel='shortcut icon']")
        self.assertTrue(my_favicon_a.is_enabled())
        self.assertTrue(my_favicon_b.is_enabled())

    def test_check_nbsp_when_viewing(self):
        note_text = "<p>&nbsp;</p> <p>Some text</p>"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(2)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            global_id = self._get_random_name(16),
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()
        self.driver.refresh()
        time.sleep(2)

        button_click_on_first_note = self.driver.find_element_by_css_selector(".notes_list li:first-child")
        button_click_on_first_note.click()
        time.sleep(4)

        empty = self.driver.find_element_by_css_selector("#scrollbarNotesText .jspPane:first-child p")
        not_empty = self.driver.find_element_by_css_selector("#scrollbarNotesText .jspPane p:nth-last-child(1)")
        self.assertEqual(empty.text, " ")
        self.assertNotEqual(not_empty.text, " ")
        delete_note_button = self.driver.find_element_by_css_selector(".action_buttons.head_note a.trash")
        delete_note_button.click()
        time.sleep(1)
        confirmation_button = self.driver.find_element_by_css_selector("button.btn.btn-warning")
        confirmation_button.click()
        self._remove_item_without_ui(folder_data["global_id"])

    def test_checking_quota_options(self):
        user_button = self.driver.find_element_by_css_selector(".user_mail")
        ActionChains(self.driver).move_to_element(user_button)
        time.sleep(2)
        user_button.click()
        time.sleep(2)

        settings_button = self.driver.find_element_by_css_selector(".user_mail ul li:nth-child(2)")
        ActionChains(self.driver).move_to_element(settings_button)
        time.sleep(2)
        settings_button.click()
        time.sleep(2)

        quota_progresbar = self.driver.find_element_by_css_selector(".progress-striped.active.progress")
        quota_time_end = self.driver.find_element_by_css_selector(".settings div p.ng-binding")
        get_more_button = self.driver.find_element_by_css_selector('.progress_panel a')
        self.assertFalse(get_more_button.is_displayed())
        go_to_pro_link = self.driver.find_element_by_css_selector(
            ".settings div[ng-controller= 'UserController'] :nth-child(8)")
        ActionChains(self.driver).move_to_element(go_to_pro_link)
        time.sleep(2)
        go_to_pro_link.click()
        time.sleep(2)
        self.driver.get(self.url)
        self.driver.refresh()

    def test_delete_empty_folder_and_go_to_default_folder(self):
        my_notes_menu_item = self.driver.find_element_by_css_selector("li#default")
        ActionChains(self.driver).move_to_element(my_notes_menu_item)
        my_notes_menu_item.click()
        time.sleep(2)
        ActionChains(self.driver).move_to_element(self.driver.find_element_by_css_selector('.tree_nav'))
        add_folder_button = self.driver.find_element_by_css_selector("a.add_folder")
        add_folder_button.click()
        time.sleep(2)
        button_create_folder = self.driver.find_element_by_css_selector("button.btn.btn-warning")
        self.assertIsNotNone(button_create_folder)
        button_create_folder.click()
        time.sleep(2)
        my_new_folder = self.driver.find_element_by_css_selector(".folder_short.ng-binding[title='folder']")
        self.assertIsNotNone(my_new_folder)
        my_new_folder.click()
        time.sleep(2)
        self._context_click(my_new_folder)

        context_delete_button = self.driver.find_element_by_css_selector('.dropdown-menu li:last-child a')
        context_delete_button.click()

        button_delete_note = self.driver.find_element_by_css_selector("button.btn.btn-warning")
        self.assertIsNotNone(button_delete_note)
        button_delete_note.click()
        time.sleep(10)
        folder_name = self.driver.find_element_by_css_selector(".head.notes")
        folder_title = folder_name.get_attribute('title')
        self.assertEqual(folder_title, "My Notes")

    def test_todo_add_not_remove_text(self):
        note_text = u"test text"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(2)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            global_id = self._get_random_name(16),
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()
        self.driver.refresh()
        time.sleep(2)
        add_todo = self.driver.find_element_by_css_selector(".btn.grey.todo")
        add_todo.click()
        time.sleep(1)

        self.driver.find_element_by_css_selector(".todo_text").send_keys("to_todo")
        time.sleep(2)
        self.driver.find_element_by_css_selector(".btn-primary").click()
        time.sleep(3)
        self.driver.refresh()
        time.sleep(2)
        note = self.driver.find_element_by_css_selector("#all_text")
        after_save_text = note.text
        self.assertIsNotNone(after_save_text)
        self.assertEqual(after_save_text, note_text)
        self._remove_item_without_ui(folder_data["global_id"])
        self._default_state()

    def test_todo_add_not_remove_attach(self):
        note_text = "<p>some text</p>"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(4)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title=u"test_note",
            text=note_text,
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()

        note_id = note_data["global_id"]
        attach_fname = '114-1024.JPG'
        fixture_file = self.check_fixture_file(attach_fname)

        attach = self._do_attachment_upload(fixture_file=fixture_file,
                                            note_id=note_id)

        text_with_attach = '<p>  some text </p>'
        note_data_2 = self._create_note_without_ui(
            text=text_with_attach,
            global_id=note_data["global_id"]
        )["body"]["notes"]
        time.sleep(4)
        created_note = self.driver.find_element_by_id(note_id)
        created_note.click()

        time.sleep(8)
        add_todo = self.driver.find_element_by_css_selector(".btn.grey.todo")
        add_todo.click()
        time.sleep(2)
        self.driver.find_element_by_css_selector(".todo_text").send_keys(u"to_todo")
        self.driver.find_element_by_css_selector(".btn-primary").click()
        time.sleep(2)
        self.driver.refresh()
        time.sleep(4)
        note_data_with_text = self._get_notes_with_text(note_id)["body"]["notes"][0]
        note_text_after_save = note_data_with_text["text"]
        self.assertEqual(note_text_after_save, text_with_attach)
        self._remove_item_without_ui(folder_data["global_id"])
        
    def test_open_close_attach_menu_in_main(self):
        attach_fname = '114-1024.JPG'
        data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = attach_fname)

        open_close_attach_button = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view')
        open_close_attach_button.click()
        first_note = self.driver.find_element_by_css_selector('.notes_content .attaches_list li:first-child .attachments_names')
        attaches_menu = self.driver.find_element_by_css_selector('.notes_content .attaches_menu')
        self.assertTrue(first_note.is_displayed())
        self.assertTrue(attaches_menu.is_displayed())
        self.assertEqual(first_note.text.upper(), attach_fname+" 233.431 KB")
        open_close_attach_button.click()
        self.assertFalse(attaches_menu.is_displayed())
        self._remove_item_without_ui(data[0]["global_id"])

    def test_open_close_images_menu(self):
        note_text = u"test text"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(4)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title=u"test_note",
            text=note_text,
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()

        note_id = note_data["global_id"]
        attach_fname = 'attach-1.jpg'
        fixture_file = self.check_fixture_file(attach_fname)

        attach = self._do_attachment_upload(fixture_file=fixture_file,
                                            note_id=note_id)

        text_with_attach = '<p>some text</p>'
        note_data_2 = self._create_note_without_ui(
            text=text_with_attach,
            global_id=note_data["global_id"]
        )["body"]["notes"]
        time.sleep(4)
        created_note = self.driver.find_element_by_id(note_id)
        created_note.click()
        edit_button = self.driver.find_element_by_css_selector('.head_note .edit')
        edit_button.click()
        self.driver.maximize_window()
        menu_button = self.driver.find_element_by_css_selector('#mce_17 button')
        menu_button.click()
        images_menu = self.driver.find_element_by_css_selector('#imagesList')
        self.assertTrue(images_menu.is_displayed())
        menu_button.click()
        self.assertFalse(images_menu.is_displayed())
        menu_button.click()
        close_from_itself_button = self.driver.find_element_by_css_selector('#imagesList .remove_select')
        close_from_itself_button.click()
        self.assertFalse(images_menu.is_displayed())
        self._remove_item_without_ui(folder_data["global_id"])

    def test_download_attach(self):
        data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = 'attach-1.jpg')
        open_attach_button = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view')
        open_attach_button.click()
        attach = self.driver.find_element_by_css_selector('.attachments_names a')
        self.assertEqual('_blank', attach.get_attribute('target'))
        self.assertEqual('attach-1.jpg', attach.get_attribute('download'))
        self.assertEqual('attach-1.jpg', attach.get_attribute('download'))
        self.assertIn('attach-1.jpg', attach.get_attribute('href'))
        self._remove_item_without_ui(data[1]["global_id"])

    def test_refresh_noteslist_when_add_todo(self):
        note_text = u"test text"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        self.driver.implicitly_wait(4000)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        self.driver.implicitly_wait(2000)
        note1_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            parent_id = folder_data["global_id"]
        )["body"]["notes"][0]
        note2_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            parent_id = folder_data["global_id"]
        )["body"]["notes"][0]
        self.driver.implicitly_wait(2000)
        folder.click()
        self.driver.implicitly_wait(6000)
        second_note = self.driver.find_element_by_id(note1_data["global_id"])
        second_note.click()
        self.driver.implicitly_wait(2000)
        todo_open_menu = self.driver.find_element_by_css_selector('.notes_content .todo')
        todo_open_menu.click()
        self.driver.implicitly_wait(1000)
        input_todo = self.driver.find_element_by_css_selector('.todo_text')
        input_todo.send_keys("todo_example")
        add_todo = self.driver.find_element_by_css_selector('.notes_content .btn-primary')
        add_todo.click()
        time.sleep(2)
        expected_first_note = self.driver.find_element_by_css_selector('.first')

        self.assertEqual(expected_first_note.get_attribute('id'), note1_data["global_id"])
        self._remove_item_without_ui(folder_data["global_id"])

    def test_scrolls_in_share(self):
        folder_name = self._get_random_name(12)
        result = self._create_folder_without_ui(folder_name)
        time.sleep(3)
        self.driver.refresh()
        self.assertIsNotNone(result)
        folder = result["body"]["notes"][0]
        self.assertIsNotNone(folder)
        selected_folder = self._select_folder_by_name(folder['title'])
        selected_folder.click()
        time.sleep(2)
        text = '<div><div style="width:5000px; height:10000px; border:1px solid;">loreup ipsum</div></div>'
        note = self._create_note_without_ui(text=text, parent_id=folder["global_id"], title='1234')["body"]["notes"][0]
        share_result = self._get_note_url_without_ui(note["global_id"])["body"]["notes_shared"][0][note["global_id"]]
        self.driver.get(self.url.replace("/client/", "") + share_result)
        self.driver.get(self.url)

    def test_tools_menu(self):

        tools = self.driver.find_element_by_css_selector('#toolsButton .jq-selectbox__select-text')
        tools.click()
        time.sleep(2)
        two = self.driver.find_element_by_css_selector(".jq-selectbox__dropdown.tools_menu ul:first-child li:nth-child(2)")
        five = self.driver.find_element_by_css_selector(".jq-selectbox__dropdown.tools_menu ul:first-child li:nth-child(5)")
        self.assertTrue(two.is_displayed())
        self.assertTrue(five.is_displayed())
        direct = self.driver.find_element_by_css_selector(".jq-selectbox__dropdown.tools_menu ul:nth-child(2)")
        self.assertTrue(direct.is_enabled())
    
    def test_short_url(self):
        self._get_shared_link()
        short_url = self.driver.find_element_by_css_selector(".short_url")
        short_url.click()
        time.sleep(5)
        header = self.driver.find_element_by_css_selector(".modal-header h3").text
        self.assertEqual(header, "Short Link:")
        link_shared = self.driver.find_element_by_css_selector(".modal-body.ng-binding input").get_attribute("value")
        self.assertNotEqual(link_shared, "")
        self.assertNotEqual(link_shared, "undefined")
        self._default_state()
    
    def test_for_save_to_my_nimbus(self):
        attach_name = self._get_shared_link()
        time.sleep(3)
        save_to_nimbus = self.driver.find_element_by_css_selector(".btn.blue.save_to_my")
        save_to_nimbus.click()
        time.sleep(5)
        header = self.driver.find_element_by_css_selector(".modal-header h3").text
        self.assertEqual(header, "Copying:")
        link_shared = self.driver.find_element_by_css_selector(".modal-body.ng-binding").text
        self.assertNotEqual(link_shared, "")
        self.assertNotEqual(link_shared, "undefined")
        self._default_state()

        open_close_attach_button = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view')
        open_close_attach_button.click()
        count_attaches = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view span').text
        self.assertEqual(count_attaches, "1")

        attach_obj_after_save = self.driver.find_element_by_css_selector('.head_notes .attaches_list li:first-child a')
        attach_name_after_save = attach_obj_after_save.get_attribute('download')
        self.assertIn( attach_name, attach_name_after_save.upper())

    def test_scroll_when_view_note(self):
        folder_name = self._get_random_name(12)
        result = self._create_folder_without_ui(folder_name)
        time.sleep(3)
        self.assertIsNotNone(result)
        folder = result["body"]["notes"][0]
        self.assertIsNotNone(folder)
        time.sleep(2)
        text = '<div><div style="width:5000px; height:10000px; border:1px solid;">loreup ipsum</div></div>'
        note = self._create_note_without_ui(title='qwerty', text=text, parent_id=folder["global_id"])["body"]["notes"][0]
        self.driver.refresh()
        selected_folder = self._select_folder_by_name(folder['title'])
        selected_folder.click()

        time.sleep(5)
        self.driver.find_element_by_id(note["global_id"]).click()
        time.sleep(5)
        scroll = self.driver.find_element_by_css_selector("#scrollbarNotesText .jspVerticalBar")
        scroll_h = self.driver.find_element_by_css_selector("#scrollbarNotesText .jspHorizontalBar")
        self.assertTrue(scroll.is_displayed())
        self.assertTrue(scroll_h.is_displayed())
        time.sleep(5)
        self._del_folder_without_ui(folder["global_id"])

    def test_show_or_hide_top_menu_in_editor(self):
        self._create_folder_without_ui("editorTopMenu")
        self.driver.refresh()
        time.sleep(10)
        editorFolder = self._select_folder_by_name("editorTopMenu")
        editorFolder.click()
        time.sleep(5)
        new_note_button = self.driver.find_element_by_css_selector(".btn-wrapper button")
        new_note_button.click()
        time.sleep(5)
        top = self.driver.find_element_by_css_selector(".show_panel_button")
        top.click()
        time.sleep(5)
        top_menu_one = self.driver.find_element_by_css_selector(".sub_header.edit_note.edit_mode")
        top_menu_two = self.driver.find_element_by_css_selector(".main.edit_mode #scrollbarY4.custom_scroll.edit_note .tag_line:first-child")
        self.assertFalse(top_menu_one.is_displayed())
        self.assertFalse(top_menu_two.is_displayed())
        time.sleep(5)
        top = self.driver.find_element_by_css_selector(".show_panel_button")
        top.click()
        time.sleep(5)
        top_menu_one = self.driver.find_element_by_css_selector(".sub_header.edit_note.edit_mode")
        top_menu_two = self.driver.find_element_by_css_selector(".main.edit_mode #scrollbarY4.custom_scroll.edit_note .tag_line:first-child")
        self.assertTrue(top_menu_one.is_displayed())
        self.assertTrue(top_menu_two.is_displayed())


    #     правити
    def test_count_attaches(self):

        attach_fname = '114-1024.JPG'
        data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = '114-1024.JPG')
        open_close_attach_button = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view')
        count_attaches = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view span').text
        self.assertEqual(count_attaches, "1")
        open_close_attach_button.click()
        delete_attach_button = self.driver.find_element_by_css_selector('.notes_content .attaches_list li:first-child .delete_attach_btn')
        delete_attach_button.click()
        time.sleep(2)
        count_attaches = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view span').text
        self.assertEqual(count_attaches, "0")
        self._remove_item_without_ui(data[0]["global_id"])

    def test_close_attach_menu_from_itself(self):
        note_text = "<p>some text</p>"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(4)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title=u"test_note",
            text=note_text,
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()

        if self.driver.find_element_by_css_selector('.notes div').is_displayed():
            self.driver.find_element_by_css_selector('.notes span').click()
        note_id = note_data["global_id"]
        attach_fname = '114-1024.JPG'
        fixture_file = self.check_fixture_file(attach_fname)

        attach = self._do_attachment_upload(fixture_file=fixture_file,
                                            note_id=note_id)

        text_with_attach = '<p>some text</p>'
        note_data_2 = self._create_note_without_ui(
            text=text_with_attach,
            global_id=note_data["global_id"]
        )["body"]["notes"]
        time.sleep(4)
        created_note = self.driver.find_element_by_id(note_id)
        created_note.click()
        time.sleep(3)
        open_attach_button = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view')
        open_attach_button.click()

        attaches_menu = self.driver.find_element_by_css_selector('.notes_content .attaches_menu')
        self.assertTrue(attaches_menu.is_displayed())
        self.driver.maximize_window()
        close_attach_button = self.driver.find_element_by_css_selector('.notes_content .remove_select')
        close_attach_button.click()
        self.assertFalse(attaches_menu.is_displayed())
        self._remove_item_without_ui(folder_data["global_id"])

    def test_click_to_open_products_menu(self):
        data = self._create_folder_and_note_with_image_attach(in_list = True)
        share_result = self._get_note_url_without_ui(data[0]["global_id"])["body"]["notes_shared"][0][data[0]["global_id"]]
        self.driver.get(self.url.replace("/client/", "") + share_result)
        time.sleep(2)
        get_nimbus = self.driver.find_element_by_css_selector(".user_services__select")
        get_nimbus.click()
        time.sleep(1)
        product_menu = self.driver.find_element_by_css_selector(".products_menu li:first-child a").size
        height = 55
        self.assertEqual(product_menu['height'], height)
        self._remove_item_without_ui(data[1]["global_id"])
        self._default_state()

    def test_refresh_note_tags_list(self):
        note_text = "<p>some text</p>"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(4)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title=u"test_note",
            text=note_text,
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()
        self.driver.refresh()
        time.sleep(2)

        edit_button = self.driver.find_element_by_css_selector('.head_note .edit')
        edit_button.click()

        select = self.driver.find_element_by_css_selector('.tag_line_search ul .search-field input')
        select.click()
        time.sleep(1)
        tag_name = self._get_random_name(4)
        select.send_keys(tag_name)
        add_tag_button = self.driver.find_element_by_css_selector('li.no-results a')
        add_tag_button.click()
        my_selected_tag = self.driver.find_element_by_css_selector(".tag_line_search ul.chzn-choices li.search-choice:first-child")
        self.assertTrue(my_selected_tag.text == tag_name)
        self.assertTrue(my_selected_tag.is_displayed())
        save_note_button = self.driver.find_element_by_css_selector('button.save_change')
        save_note_button.click()
        time.sleep(6)

        my_selected_tag = self.driver.find_element_by_css_selector(".tag_line_search ul.chzn-choices li.search-choice:first-child")
        self.assertTrue(my_selected_tag.text == tag_name)
        self.assertTrue(my_selected_tag.is_displayed())
        self._remove_item_without_ui(folder_data["global_id"])

    def test_hide_selected_tag_from_tagslist(self):
        note_text = "<p>some text</p>"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(4)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title=u"test_note",
            text=note_text,
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()
        self.driver.refresh()
        time.sleep(2)

        edit_button = self.driver.find_element_by_css_selector('.head_note a.edit')
        time.sleep(2)
        edit_button.click()
        list_with_not_already_selected_tag = self.driver.find_elements_by_css_selector(".tag_line_search ul.chzn-results li")
        count_with_not_already_selected_tag = list_with_not_already_selected_tag.__len__()
        select = self.driver.find_element_by_css_selector('.tag_line_search ul .search-field input')
        select.click()
        time.sleep(1)
        select_tag = self.driver.find_element_by_css_selector('.tag_line_search ul.chzn-results li:first-child')
        select_tag.click()
        time.sleep(2)
        list_with_already_selected_tag = self.driver.find_elements_by_css_selector(".tag_line_search ul.chzn-results li")
        self.assertEqual(count_with_not_already_selected_tag, list_with_already_selected_tag.__len__())
        self._remove_item_without_ui(folder_data["global_id"])

    def test_no_tags_dublicates_in_tags_list(self):
        note_text = "<p>some text</p>"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(4)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title=u"test_note",
            text=note_text,
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()
        self.driver.refresh()
        time.sleep(5)

        edit_button = self.driver.find_element_by_css_selector('.head_note .edit')
        edit_button.click()

        list_with_not_already_selected_tag = self.driver.find_elements_by_css_selector(".tag_line_search ul.chzn-results li")
        count_with_not_already_selected_tag = list_with_not_already_selected_tag.__len__()

        select = self.driver.find_element_by_css_selector('.tag_line_search ul .search-field input')
        select.click()
        time.sleep(1)
        tag_name = self._get_random_name(4)
        select.send_keys(tag_name)
        add_tag_button = self.driver.find_element_by_css_selector('li.no-results a')
        add_tag_button.click()

        list_with_already_selected_tag = self.driver.find_elements_by_css_selector(".tag_line_search ul.chzn-results li")
        count_with_already_selected_tag = list_with_already_selected_tag.__len__()

        self.assertEqual(count_with_not_already_selected_tag+1, count_with_already_selected_tag)

        my_selected_tag = self.driver.find_element_by_css_selector(".tag_line_search ul.chzn-choices li.search-choice:first-child")
        self.assertTrue(my_selected_tag.text == tag_name)
        self.assertTrue(my_selected_tag.is_displayed())
        note_link = self.driver.find_element_by_css_selector('.tag_line_search .note_link')
        note_link.click()

        select = self.driver.find_element_by_css_selector('.tag_line_search ul .search-field input')
        select.click()
        time.sleep(1)

        tags_list_after_close_open_it = self.driver.find_elements_by_css_selector(".tag_line_search ul.chzn-results li")
        count_tags_list_after_close_open_it = tags_list_after_close_open_it.__len__()

        my_selected_tag = self.driver.find_element_by_css_selector(".tag_line_search ul.chzn-choices li.search-choice:first-child")
        self.assertEqual(count_with_not_already_selected_tag+1, count_tags_list_after_close_open_it)
        self.assertEqual(count_with_already_selected_tag, count_tags_list_after_close_open_it)
        self.assertTrue(my_selected_tag.text == tag_name)
        self.assertTrue(my_selected_tag.is_displayed())

        self._remove_item_without_ui(folder_data["global_id"])

    def _open_share_individuals_window(self, from_context = False):

        if from_context:
            my_new_folder = self.driver.find_element_by_css_selector('.sub li:last-child')
            self._context_click(my_new_folder)
            context_share_individuals_button = self.driver.find_element_by_css_selector('.dropdown-menu li:nth-last-child(2) a')
            context_share_individuals_button.click()
        else:
            share_individuals_button = self.driver.find_element_by_css_selector('.action_buttons.head_note li:nth-child(2)')
            share_individuals_button.click()

    def test_updating_text_note_after_saving(self):
        folder_name = self._get_random_name(12)
        result = self._create_folder_without_ui(folder_name)
        time.sleep(3)
        self.driver.refresh()
        self.assertIsNotNone(result)
        folder = result["body"]["notes"][0]
        self.assertIsNotNone(folder)
        selected_folder = self._select_folder_by_name(folder['title'])
        selected_folder.click()
        time.sleep(2)
        file = open("./fixtures/big_text.txt", "r")
        text = file.read()
        file.close()
        note = self._create_note_without_ui(text=text, parent_id=folder["global_id"], title='1234')["body"]["notes"][0]

        time.sleep(4)
        selected_folder.click()
        self.driver.refresh()
        time.sleep(4)
        edit_button = self.driver.find_element_by_css_selector('.head_note .edit')
        edit_button.click()
        time.sleep(2)

        editor_frame = self.driver.find_element_by_css_selector("#notes_text_ifr")
        self.driver.switch_to_frame(editor_frame)
        body = self.driver.find_element_by_css_selector("body")
        body.click()
        inputed_text = self._get_random_name(12)
        body.send_keys(inputed_text)

        self.driver.switch_to_default_content()
        save_button = self.driver.find_element_by_id('save_change_main')
        time.sleep(1)
        save_button.click()

        time.sleep(6)
        self.driver.refresh()
        time.sleep(4)

        note_text = self.driver.find_element_by_css_selector("#all_text p")
        self.assertNotEqual(note_text.text().find(inputed_text), -1)

    # def test_add_tag_with_enter_inFullWindow(self):
    #     note_text = u"Some text"
    #     folder_name = self._get_random_name(16)
    #     folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
    #     self.driver.refresh()
    #     time.sleep(2)
    #     folder = self._select_folder_by_name(folder_name)
    #     folder.click()
    #     time.sleep(2)
    #     note_data = self._create_note_without_ui(
    #         title = u"test_note",
    #         text = note_text,
    #         global_id = self._get_random_name(16),
    #         parent_id=folder_data["global_id"]
    #     )["body"]["notes"][0]
    #     time.sleep(4)
    #     folder.click()
    #     self.driver.refresh()
    #     time.sleep(2)
    #
    #     edit_button = self.driver.find_element_by_css_selector(".head_note a.edit")
    #     edit_button.click()
    #     time.sleep(5)
    #     select = self.driver.find_element_by_css_selector(".tag_line .tag_line_search form input")
    #     time.sleep(5)
    #     text = self._get_random_name(15)
    #     select.send_keys(text)
    #     time.sleep(3)
    #     ActionChains(self.driver).send_keys_to_element(select, Keys.ENTER).perform()
    #     time.sleep(2)
    #     save = self.driver.find_element_by_css_selector("#save_change_main")
    #     save.click()
    #     time.sleep(5)
    #     first_note = self.driver.find_element_by_css_selector(".notes_list li:first-child")
    #     ActionChains(self.driver).context_click(first_note).perform()
    #     dropdown = self.driver.find_element_by_css_selector(".dropdown-menu li:nth-child(3)")
    #     ActionChains(self.driver).click(dropdown).perform()
    #     selectinfull = self.driver.find_element_by_css_selector(".tag_line .tag_line_search form .chzn-choices li:nth-child(2)")
    #     self.assertTrue(selectinfull.is_enabled())
    #     self._remove_item_without_ui(folder_data["global_id"])
    #
    # def test_add_tag_in_current_list_inFullWindow(self):
    #     note_text = u"Some text"
    #     folder_name = self._get_random_name(16)
    #     folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
    #     self.driver.refresh()
    #     time.sleep(2)
    #     folder = self._select_folder_by_name(folder_name)
    #     folder.click()
    #     time.sleep(2)
    #     note_data = self._create_note_without_ui(
    #         title = u"test_note",
    #         text = note_text,
    #         global_id = self._get_random_name(16),
    #         parent_id=folder_data["global_id"]
    #     )["body"]["notes"][0]
    #     time.sleep(4)
    #     folder.click()
    #     self.driver.refresh()
    #     time.sleep(3)
    #
    #     first_note = self.driver.find_element_by_css_selector(".notes_list li:first-child")
    #     time.sleep(2)
    #     ActionChains(self.driver).context_click(first_note).perform()
    #     dropdown = self.driver.find_element_by_css_selector(".dropdown-menu li:nth-child(3)")
    #     dropdown.click()
    #     time.sleep(5)
    #     select = self.driver.find_element_by_css_selector("div .tag_line:nth-child(2) form input")
    #     select.click()
    #     time.sleep(3)
    #     select_tag = self.driver.find_element_by_css_selector("div .tag_line:nth-child(2) form .chzn-results li:first-child")
    #     selected_tag_name = select_tag.text
    #     select_tag.click()
    #     time.sleep(5)
    #     selectinfull = self._get_selectInFull()
    #     self.assertTrue(selectinfull.is_enabled())
    #     self.assertEqual(selectinfull.text, selected_tag_name)
    #     self._remove_item_without_ui(folder_data["global_id"])
    #
    #  def test_add_tag_with_button_inFullWindow(self):
    #     note_text = u"Some text"
    #     folder_name = self._get_random_name(16)
    #     folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
    #     self.driver.refresh()
    #     time.sleep(2)
    #     folder = self._select_folder_by_name(folder_name)
    #     folder.click()
    #     time.sleep(2)
    #     note_data = self._create_note_without_ui(
    #         title = u"test_note",
    #         text = note_text,
    #         global_id = self._get_random_name(16),
    #         parent_id=folder_data["global_id"]
    #     )["body"]["notes"][0]
    #     time.sleep(4)
    #     folder.click()
    #     self.driver.refresh()
    #     time.sleep(2)
    #
    #     first_note = self.driver.find_element_by_css_selector(".notes_list li:first-child")
    #     time.sleep(2)
    #     ActionChains(self.driver).context_click(first_note).perform()
    #     time.sleep(1)
    #     ActionChains(self.driver).context_click(first_note).perform()
    #     time.sleep(1)
    #     dropdown = self.driver.find_element_by_css_selector(".dropdown-menu li:nth-child(3)")
    #     time.sleep(1)
    #     dropdown.click()
    #     time.sleep(5)
    #     select = self.driver.find_element_by_css_selector("div .tag_line:nth-child(2) form input")
    #     text = self._get_random_name(14)
    #     select.send_keys(text)
    #     time.sleep(3)
    #     click_on_plus = self.driver.find_element_by_css_selector("#addThisTag")
    #     click_on_plus.click()
    #     time.sleep(5)
    #     selectinfull = self._get_selectInFull()
    #     self.assertTrue(selectinfull.is_enabled())
    #     self._remove_item_without_ui(folder_data["global_id"])
    #
    # def test_for_targetBlank(self):
    #     self._create_folder_without_ui("target_Blank")
    #     self.driver.refresh()
    #     time.sleep(5)
    #     click_folder = self._select_folder_by_name("target_Blank")
    #     click_folder.click()
    #     time.sleep(3)
    #     new_note_button = self.driver.find_element_by_css_selector(".btn-wrapper button")
    #     new_note_button.click()
    #     time.sleep(3)
    #     editor_frame = self.driver.find_element_by_css_selector("#notes_text_ifr")
    #     self.driver.switch_to_frame(editor_frame)
    #     body = self.driver.find_element_by_css_selector("body")
    #     time.sleep(5)
    #     body.send_keys("https://www.google.com")
    #     ActionChains(self.driver).send_keys_to_element(body, Keys.ENTER).perform()
    #     time.sleep(4)
    #     self.driver.switch_to_default_content()
    #     save_button = self.driver.find_element_by_id('save_change_main')
    #     save_button.click()
    #     time.sleep(2)
    #     self.driver.refresh()
    #     time.sleep(10)
    #     click_folder = self._select_folder_by_name("target_Blank")
    #     click_folder.click()
    #     time.sleep(5)
    #     first_note = self.driver.find_element_by_css_selector(".notes_list li:first-child")
    #     time.sleep(2)
    #     ActionChains(self.driver).click(first_note).perform()
    #     time.sleep(2)
    #     share = self.driver.find_element_by_css_selector(".heading .action_buttons.head_note .share")
    #     share.click()
    #     time.sleep(5)
    #     link = self.driver.find_element_by_css_selector("#link_text_show")
    #     link_text = link.get_attribute("value")
    #     ok = self.driver.find_element_by_css_selector(".modal-footer button.btn.btn-success")
    #     ok.click()
    #     self.driver.get(link_text)
    #     time.sleep(10)
    #     note_text_link = self.driver.find_element_by_css_selector("#note_text_share p a")
    #     self.assertEqual(note_text_link.get_attribute("target"), "_blank")
    #     self._default_state()

    # def test_saving_in_todo_list_when_add_todo(self):
    #     default_folder = self.driver.find_element_by_css_selector('.sub li[id="default"]')
    #     default_folder.click()
    #     time.sleep(1)
    #     default_folder.click()
    #     time.sleep(1)
    #     default_folder_name = self.driver.find_element_by_css_selector('.notes_content .sort_folder .jq-selectbox__select-text').text
    #     self.assertEqual('My Notes', default_folder_name)
    #
    #     data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = 'attach-2.png')
    #
    #     default_folder = self.driver.find_element_by_css_selector('.sub li[id="default"]')
    #     default_folder.click()
    #     time.sleep(1)
    #     self.assertEqual('My Notes', default_folder_name)
    #
    #     new_folder = self.driver.find_element_by_css_selector('.sub li:last-child')
    #     new_folder.click()
    #     time.sleep(2)
    #     new_folder_name = self.driver.find_element_by_css_selector('.notes_content .sort_folder .jq-selectbox__select-text').text
    #     self.assertEqual(data[1]["title"], new_folder_name)
    #
    #     self._remove_item_without_ui(data[1]["global_id"])

    def test_check_google_analist_in_share_and_mine(self):
        data = self._create_folder_and_note_with_image_attach(in_list = False, attach_name = 'attach-2.png')

        google_analist = self.driver.find_element_by_css_selector("script[src='http://www.google-analytics.com/ga.js']")
        self.assertTrue(google_analist.is_enabled())

        share_result = self._get_note_url_without_ui(data[0]["global_id"])["body"]["notes_shared"][0][data[0]["global_id"]]
        self.driver.get(self.url.replace("/client/", "") + share_result)

        google_analist = self.driver.find_element_by_css_selector("script[src='http://www.google-analytics.com/ga.js']")
        self.assertTrue(google_analist.is_enabled())

        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])


    def test_check_show_hide_attach_menu_in_share(self):
        data = self._create_folder_and_note_with_image_attach(in_list = False)
        note_id= data[0]["global_id"]
        share_result = self._get_note_url_without_ui(data[0]["global_id"])["body"]["notes_shared"][0][note_id]
        self.driver.get(self.url.replace("/client/", "") + share_result)

        attach_menu = self.driver.find_element_by_css_selector('.attaches_menu')
        self.assertFalse(attach_menu.is_displayed())

        attach_fname = '114-1024.JPG'
        fixture_file = self.check_fixture_file(attach_fname)
        attach = self._do_attachment_upload(fixture_file= fixture_file,
                                            note_id= note_id, in_list="True")

        self.driver.refresh()
        time.sleep(2)
        attach_menu = self.driver.find_element_by_css_selector('.attaches_menu')
        self.assertTrue(attach_menu.is_displayed())
        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])

    def test_check_target_of_attach_item(self):
        data = self._create_folder_and_note_with_image_attach(in_list = True)
        share_result = self._get_note_url_without_ui(data[0]["global_id"])["body"]["notes_shared"][0][data[0]["global_id"]]
        self.driver.get(self.url.replace("/client/", "") + share_result)
        attach_item = self.driver.find_element_by_css_selector(".attaches_view_list .attach-download a")
        self.assertEqual(attach_item.get_attribute("target"), '_blank')
        self.assertEqual(attach_item.get_attribute("ng-target"), '_blank')
        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])

    def test_check_img_for_every_attach_item(self):
        data = self._create_folder_and_note_with_image_attach(in_list = True)
        attach_fname = ['attach-autio-1.mp3', 'attach-archive-1.zip', 'attach-file-1.elf', 'attach-video-1.flv']

        for i in attach_fname:
            fixture_file = self.check_fixture_file(i)
            attach = self._do_attachment_upload(fixture_file = fixture_file,
                                            note_id = data[0]["global_id"],
                                            in_list = "True")
        share_result = self._get_note_url_without_ui(data[0]["global_id"])["body"]["notes_shared"][0][data[0]["global_id"]]
        self.driver.get(self.url.replace("/client/", "") + share_result)
        attach_item = self.driver.find_elements_by_css_selector(".attaches_view_list .attach-download a img")
        index = 0
        for i in attach_item:
            pattern = 'http://notes.everhelper.me/client/static/img/iconsOfAttachmentsTypes/'
            img_name = ['video_attach.png', 'archive_attach.png', 'audio_attach.png', 'file_attach.png', 'image_attach.png']
            for name in img_name:
                if pattern+name == i.get_attribute('src'):
                    index = index + 1
                    break
        self.assertEqual(index, 5)

        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])

    def _create_folder_and_note_with_image_attach(self, in_list = False, attach_name = '114-1024.JPG',
                                                  title = u'Default Title'):
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(4)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title= title,
            parent_id= folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()

        note_id = note_data["global_id"]

        fixture_file = self.check_fixture_file(attach_name)

        attach = self._do_attachment_upload(fixture_file=fixture_file,
                                            note_id=note_id, in_list=in_list)
        attach_text = ""
        if attach['body']['attachment'] is None:
            self.assertIsNotNone(attach['body']['attachment'], attach['body']['errorMessage'])
        if in_list == False:
            attach_text = '<img src="#attacheloc:'+attach['body']['attachment']['global_id']+'"/>'
        text_with_attach = '<p>  some text'+ attach_text +'</p>';
        note_data_2 = self._create_note_without_ui(
            title= title,
            text= text_with_attach,
            global_id= note_data["global_id"],
        )["body"]["notes"]
        time.sleep(4)
        created_note = self.driver.find_element_by_id(note_id)
        created_note.click()
        time.sleep(2)
        return [note_data, folder_data]


    def test_check_hide_attach_menu_when_in_list_false(self):
        data = self._create_folder_and_note_with_image_attach(in_list = False, attach_name = 'attach-2.png')
        share_result = self._get_note_url_without_ui(data[0]["global_id"])["body"]["notes_shared"][0][data[0]["global_id"]]
        self.driver.get(self.url.replace("/client/", "") + share_result)
        atach_menu = self.driver.find_element_by_css_selector('.attaches_menu')
        self.assertFalse(atach_menu.is_displayed())
        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])

    def test_create_new_tab_to_click_on_img(self):
        data = self._create_folder_and_note_with_image_attach(in_list = False, attach_name = 'attach-2.png')
        share_result = self._get_note_url_without_ui(data[0]["global_id"])["body"]["notes_shared"][0][data[0]["global_id"]]
        self.driver.get(self.url.replace("/client/", "") + share_result)

        image = self.driver.find_element_by_css_selector("#note_text_share img")

        image.click()
        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])

    def test_saving_in_todo_list_when_add_todo(self):
        todo = "todo_example"
        data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = 'attach-2.png')
        todo_open_menu = self.driver.find_element_by_css_selector('.notes_content .todo')
        todo_open_menu.click()
        self.driver.implicitly_wait(1000)
        input_todo = self.driver.find_element_by_css_selector('.todo_text')
        input_todo.send_keys(todo)
        add_todo = self.driver.find_element_by_css_selector('.notes_content .btn-primary')
        add_todo.click()
        time.sleep(2)
        added_todo = self.driver.find_element_by_css_selector('form:last-child p:nth-child(2)')

        self.assertTrue(added_todo.is_displayed())
        self.assertEqual(todo, added_todo.text)
        self._remove_item_without_ui(data[1]["global_id"])

    def test_move_note_to_another_folder(self):
        data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = 'attach-2.png')

        default_folder = self.driver.find_element_by_css_selector('.sub li[id="default"]')
        time.sleep(2)
        default_folder.click()
        time.sleep(2)
        count_notes = self.driver.find_elements_by_css_selector('.notes_list li').__len__()

        new_folder = self.driver.find_element_by_css_selector('.sub li:last-child')
        new_folder.click()
        self.driver.get(self.url)
        time.sleep(5)
        folders_list = self.driver.find_element_by_css_selector('.sort_folder span:first-child .jq-selectbox__trigger-arrow')
        time.sleep(1)
        folders_list.click()
        time.sleep(2)
        default_folder_in_list = self.driver.find_element_by_css_selector('.notes_content .jq-selectbox__dropdown ul li:last-child')
        default_folder_in_list.click()

        time.sleep(3)

        folders_list = self.driver.find_element_by_css_selector('.notes_content .jq-selectbox__trigger-arrow')
        folders_list.click()
        time.sleep(3)
        default_folder_in_list = self.driver.find_element_by_css_selector('.notes_content .jq-selectbox__dropdown ul li:last-child')
        default_folder_in_list.click()

        time.sleep(1)
        count_notes_after_moving = self.driver.find_elements_by_css_selector('.notes_list li').__len__()
        self.assertEqual(count_notes+1, count_notes_after_moving)
        self._remove_item_without_ui(data[1]["global_id"])

    def test_check_download_atribute_on_display_name(self):
        attach_name = '114-1024.JPG'
        data = self._create_folder_and_note_with_image_attach(in_list = True)
        open_attach_button = self.driver.find_element_by_css_selector('.btn.grey.attache.edit_mode.main_view')
        open_attach_button.click()

        download_attr_a = self.driver.find_element_by_css_selector('.notes_content .attachments_names a').get_attribute('download')
        self.assertEqual(download_attr_a, attach_name)
        share_result = self._get_note_url_without_ui(data[0]["global_id"])["body"]["notes_shared"][0][data[0]["global_id"]]
        self.driver.get(self.url.replace("/client/", "") + share_result)

        download_attr_b = self.driver.find_element_by_css_selector('.attachments_names a').get_attribute('download')
        self.assertEqual(download_attr_b, attach_name)

        download_attr_c = self.driver.find_element_by_css_selector('.attach-download a:nth-last-child(2)').get_attribute('download')
        self.assertEqual(download_attr_c, attach_name)

        self._remove_item_without_ui(data[1]["global_id"])
        self._default_state()

    def test_refresh_selected_folder_in_previu_when_delete_note(self):
        note_text = u"test text"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        self.driver.implicitly_wait(4000)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        self.driver.implicitly_wait(2000)
        note1_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            parent_id = folder_data["global_id"]
        )["body"]["notes"][0]
        note2_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            parent_id = folder_data["global_id"]
        )["body"]["notes"][0]
        self.driver.implicitly_wait(2000)
        folder.click()
        self.driver.implicitly_wait(6000)
        second_note = self.driver.find_element_by_id(note1_data["global_id"])
        second_note.click()
        self.driver.implicitly_wait(2000)
        current_folder_name = self.driver.find_element_by_css_selector('.folderListView .jq-selectbox__select-text').text

        delete_button = self.driver.find_element_by_css_selector('.action_buttons.head_note li:last-child a')
        delete_button.click()
        button_delete_note = self.driver.find_element_by_css_selector("button.btn.btn-warning")
        self.assertIsNotNone(button_delete_note)
        button_delete_note.click()
        time.sleep(5)

        current_folder_name_after_remove = self.driver.find_element_by_css_selector('.folderListView .jq-selectbox__select-text').text
        self.assertEqual(current_folder_name, current_folder_name_after_remove)
        self._remove_item_without_ui(folder_data["global_id"])

    def check_show_tags_list_button_position(self):
        data = self._create_folder_and_note_with_image_attach(in_list = True)

        edit_button = self.driver.find_element_by_css_selector(".head_note a.edit")
        edit_button.click()
        time.sleep(5)

        size_litle_list = self.driver.find_element_by_css_selector(".chzn-choices")
        self.assertEqual(size_litle_list.value_of_css_property('width'), '434px')
        self.assertEqual(size_litle_list.value_of_css_property('height'), '31px')

        chzn_results = self.driver.find_element_by_css_selector(".chzn-results")
        self.assertEqual(chzn_results.value_of_css_property('width'), '178px')
        self.assertEqual(chzn_results.value_of_css_property('height'), '190px')

        chzn_drop = self.driver.find_element_by_css_selector(".chzn-drop")
        self.assertEqual(chzn_drop.value_of_css_property('width'), '178px')
        self.assertEqual(chzn_drop.value_of_css_property('height'), '192px')

        first_note = self.driver.find_element_by_css_selector(".notes_list li:first-child")
        ActionChains(self.driver).context_click(first_note).perform()
        dropdown = self.driver.find_element_by_css_selector(".dropdown-menu li:nth-child(3) a")
        dropdown.click()

        time.sleep(4)

        size_litle_list = self.driver.find_element_by_css_selector(".chzn-choices")
        self.assertEqual(size_litle_list.value_of_css_property('width'), '434px')
        self.assertEqual(size_litle_list.value_of_css_property('height'), '31px')

        chzn_results = self.driver.find_element_by_css_selector(".chzn-results")
        self.assertEqual(chzn_results.value_of_css_property('width'), 'auto')
        self.assertEqual(chzn_results.value_of_css_property('height'), 'auto')

        chzn_drop = self.driver.find_element_by_css_selector(".chzn-drop")
        self.assertEqual(chzn_drop.value_of_css_property('width'), '178px')
        self.assertEqual(chzn_drop.value_of_css_property('height'), 'auto')

        self._remove_item_without_ui(data[1]["global_id"])
        self._default_state()

    def check_moving_search_item_in_search(self):
        data = self._create_folder_and_note_with_image_attach(folder_name = self._get_random_name(20), in_list = True)
        edit_button = self.driver.find_element_by_css_selector(".head_note a.edit")
        edit_button.click()
        time.sleep(5)

        size_search_in_edit = self.driver.find_element_by_css_selector(".chzn-choices.edit_mode_search").size
        self.assertEqual(size_search_in_edit['width'], 372)
        self.assertEqual(size_search_in_edit['height'], 33)

        size_search_field_in_edit = self.driver.find_element_by_css_selector(".chzn-choices.edit_mode_search .search-field").size
        self.assertEqual(size_search_field_in_edit['width'], 175)
        self.assertEqual(size_search_field_in_edit['height'], 31)

        select = self.driver.find_element_by_css_selector("div .tag_line:nth-child(1) form .search-field input")
        select.click()
        text = self._get_random_name(14)
        select.send_keys(text)
        time.sleep(1)
        click_on_plus = self.driver.find_element_by_css_selector("#addThisTag")
        click_on_plus.click()


        self.driver.get(self.url)
        time.sleep(4)
        tags_menu_item = self.driver.find_element_by_css_selector('.tags span')
        tags_menu_item.click()
        time.sleep(1)
        new_tag = self.driver.find_element_by_css_selector('.tags div .sub li:first-child')
        new_tag.click()
        time.sleep(4)

        edit_button = self.driver.find_element_by_css_selector(".head_note a.edit")
        edit_button.click()
        time.sleep(5)

        size_search_in_edit = self.driver.find_element_by_css_selector(".chzn-choices.edit_mode_search").size
        self.assertEqual(size_search_in_edit['width'], 372)
        self.assertEqual(size_search_in_edit['height'], 33)

        size_search_field_in_edit = self.driver.find_element_by_css_selector(".chzn-choices.edit_mode_search .search-field").size
        self.assertEqual(size_search_field_in_edit['width'], 74)
        self.assertEqual(size_search_field_in_edit['height'], 31)

        self._remove_item_without_ui(data[1]["global_id"])
        self._default_state()

    def test_check_show_share_individuals_window(self):
        data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = 'attach-2.png')
        self._open_share_individuals_window(from_context = True)
        invite_window = self.driver.find_element_by_css_selector('.modal.fade')
        self.assertTrue(invite_window.is_displayed())
        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])

    def _create_invite(self, email = "example@i.ua"):
        self._open_share_individuals_window(from_context = True)
        email_textarea = self.driver.find_element_by_css_selector('input.invite_email_input')
        email_textarea.send_keys(email)
        send_button = self.driver.find_element_by_css_selector('.form_invites button.btn.blue')
        send_button.click()
        time.sleep(1)

    def test_check_create_new_invite(self):
        email = "example@i.ua"
        data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = 'attach-2.png')
        self._create_invite(email = email)
        invite_email = self.driver.find_element_by_css_selector('.introdused_emails li p').text
        used_invite_email = self.driver.find_element_by_css_selector('.inviteright li').text
        self.assertEqual(invite_email, email)
        self.assertEqual(used_invite_email, email)
        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])

    def test_check_delete_invite(self):
        email = "example@i.ua"
        data = self._create_folder_and_note_with_image_attach(in_list = True, attach_name = 'attach-2.png')
        self._create_invite(email = email)
        invite_email = self.driver.find_element_by_css_selector('.introdused_emails li p').text
        self.assertEqual(invite_email, email)
        invite_item = self.driver.find_element_by_css_selector('.introdused_emails li')
        ActionChains(self.driver).move_to_element(invite_item).perform()
        time.sleep(1)
        remove_invite_but = self.driver.find_element_by_css_selector('span.delete_attach_btn')
        remove_invite_but.click()
        self._default_state()
        self._remove_item_without_ui(data[1]["global_id"])
    
    def test_share_button_checkbox(self):
        note_text = u"Some text"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(2)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            global_id = self._get_random_name(16),
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()
        self.driver.refresh()
        time.sleep(5)

        share_unshare_button = self.driver.find_element_by_css_selector(".head_note a.share")
        self.assertIsNotNone(share_unshare_button)
        share_unshare_button.click()
        time.sleep(3)
        checkbox = self.driver.find_element_by_css_selector(".squaredThree label")
        checkbox.click()
        password = self.driver.find_element_by_css_selector(".password")
        text = "password"
        password.send_keys(text)
        ok = self.driver.find_element_by_css_selector(".form_password button.blue")
        ok.click()
        share_button = self.driver.find_element_by_css_selector(".title_password .remove_select")
        share_unshare_button = self.driver.find_element_by_css_selector(".head_note a.share")
        self.assertIsNotNone(share_unshare_button)
        share_unshare_button.click()
        time.sleep(3)
        # ckeck_input = self.driver.find_element_by_css_selector(".squaredThree input")

    def test_check_none_margine_when_viewing(self):
        note_text = "<p>&nbsp;</p> <p>sdsdsdsdsdsdsdsdsdsdsdsdd</p> <p>Some text</p>"
        folder_name = self._get_random_name(16)
        folder_data = self._create_folder_without_ui(folder_name)["body"]["notes"][0]
        self.driver.refresh()
        time.sleep(2)
        folder = self._select_folder_by_name(folder_name)
        folder.click()
        time.sleep(2)
        note_data = self._create_note_without_ui(
            title = u"test_note",
            text = note_text,
            global_id = self._get_random_name(16),
            parent_id=folder_data["global_id"]
        )["body"]["notes"][0]
        time.sleep(4)
        folder.click()
        self.driver.refresh()
        time.sleep(2)

        button_click_on_first_note = self.driver.find_element_by_css_selector(".notes_list li:first-child")
        button_click_on_first_note.click()
        time.sleep(4)

        margine_none = self.driver.find_element_by_css_selector("#scrollbarNotesText .jspPane:first-child p:nth-last-child(1)")\
                        .value_of_css_property("margin");

        self.assertEqual(margine_none, '');
        delete_note_button = self.driver.find_element_by_css_selector(".action_buttons.head_note a.trash")
        delete_note_button.click()
        time.sleep(1)
        confirmation_button = self.driver.find_element_by_css_selector("button.btn.btn-warning")
        confirmation_button.click()
        self._remove_item_without_ui(folder_data["global_id"])