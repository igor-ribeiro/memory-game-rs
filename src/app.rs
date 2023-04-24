use crate::components::board::Board;
use crate::components::game_provider::GameProvider;
use crate::components::players::Players;
use crate::game::GameInit;
use yew::prelude::*;

#[function_component(App)]
pub fn app() -> Html {
    let init = use_state::<Option<GameInit>, _>(|| None);

    let set_init = {
        let init = init.clone();

        Callback::from(move |value: GameInit| init.set(Some(value)))
    };

    if init.is_none() {
        return html! {
            <div class="p-2 flex flex-col gap-4 items-center">
                <h1 class="font-bold text-3xl">{"Novo Jogo"}</h1>

                <div class="text-center">
                    <h2 class="font-bold text-xl">{"Jogar sozinho"}</h2>
                    <div class="flex gap-1">
                        <button class="btn" onclick={set_init.clone().reform(move |_| GameInit::Time { single: true })}>{"Tempo"}</button>
                        <button class="btn" onclick={set_init.clone().reform(move |_| GameInit::Hits { single: true })}>{"Pontos"}</button>
                    </div>
                </div>

                <div class="text-center">
                    <h2 class="font-bold text-xl">{"Jogar em dois"}</h2>
                    <div class="flex gap-1">
                        <button class="btn" onclick={set_init.clone().reform(move |_| GameInit::Time { single: false })}>{"Tempo"}</button>
                        <button class="btn" onclick={set_init.clone().reform(move |_| GameInit::Hits { single: false })}>{"Pontos"}</button>
                    </div>
                </div>
            </div>
        };
    }

    html! {
        <GameProvider init={init.unwrap()}>
            <div class="p-2 flex flex-col gap-4 items-center">
                <Players />
                <Board />
            </div>
        </GameProvider>
    }
}
