use yew::prelude::*;

use crate::components::{
    card_type_input::CardTypeInput, game_mode_input::GameModeInput,
    score_type_input::ScoreTypeInput,
};

#[function_component(GameSetupForm)]
pub fn game_setup_form() -> Html {
    html! {
        <div class="bg-green-200 rounded p-4 cartoon w-full max-w-fit mx-auto flex flex-col gap-4 items-center">
            <h1 class="uppercase font-black text-3xl">{"Jogo da memória"}</h1>
            <GameModeInput />
            <ScoreTypeInput />
            <CardTypeInput />
        </div>
    }
}
