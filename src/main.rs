mod app;
mod game;

use app::App;
use yew::Renderer;

fn main() {
    wasm_logger::init(wasm_logger::Config::default());
    Renderer::<App>::new().render();
}
