// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, Submenu};

fn main() {
    let open_menu = CustomMenuItem::new("open", "開く");
    let save_menu = CustomMenuItem::new("save", "保存");
    let close_menu = CustomMenuItem::new("close", "閉じる");
    let file_menu = Submenu::new(
        "ファイル",
        Menu::new()
            .add_item(open_menu)
            .add_item(save_menu)
            .add_item(close_menu),
    );
    tauri::Builder::default()
        .menu(Menu::new().add_submenu(file_menu))
        .on_menu_event(|event| match event.menu_item_id() {
            "open" => {
                event.window().emit("open", {}).unwrap();
            }
            "save" => {
                event.window().emit("save", {}).unwrap();
            }
            "close" => {
                event.window().close().unwrap();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
