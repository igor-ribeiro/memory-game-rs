mod app;
mod components;
mod constants;
mod game;
mod utils;

use app::App;
use yew::Renderer;

fn main() {
    wasm_logger::init(wasm_logger::Config::default());
    Renderer::<App>::new().render();
}
