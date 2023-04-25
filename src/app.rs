use crate::components::board::Board;
use crate::components::game_provider::GameProvider;
use crate::components::players::Players;
use crate::game::{GameMode, GameSetup, PointsType};
use yew::prelude::*;

#[function_component(App)]
pub fn app() -> Html {
    let setup = use_state::<(Option<bool>, Option<bool>), _>(|| (None, None));

    let on_reset_setup = {
        let setup = setup.clone();

        move |_| {
            setup.set((None, None));
        }
    };

    let on_set_mode = {
        let mode = setup.clone();
        Callback::from(move |next_mode: bool| {
            mode.set((Some(next_mode), mode.1));
        })
    };

    let on_set_points = {
        let setup = setup.clone();
        Callback::from(move |next_points: bool| {
            setup.set((setup.0, Some(next_points)));
        })
    };

    if setup.0.is_none() || setup.1.is_none() {
        return html! {
            <div class="p-2 flex flex-col gap-4 items-center">
                <h1 class="font-bold text-3xl">{"Jogo da memória"}</h1>

                <div class="text-center">
                    <h2 class="font-bold text-xl">{"Jogar sozinho"}</h2>
                    <div class="btn-group">
                        <button
                            class={classes!("btn", setup.0.eq(&Some(true)).then_some("active"))}
                            onclick={on_set_mode.clone().reform(move |_| true)}
                        >
                            {"Sim"}
                        </button>
                        <div class="btn-group-divider"/>
                        <button
                            class={classes!("btn", setup.0.eq(&Some(false)).then_some("active"))}
                            onclick={on_set_mode.clone().reform(move |_| false)}
                        >
                            {"Não"}
                        </button>
                    </div>
                </div>

                <div class="text-center">
                    <h2 class="font-bold text-xl">{"Pontuação"}</h2>
                    <div class="btn-group">
                        <button
                            class={classes!(
                                "btn",
                                if let Some(true) = setup.1 {
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={on_set_points.clone().reform(move |_| true)}
                        >
                            {"Acertos"}
                        </button>
                        <div class="btn-group-divider"/>
                        <button
                            class={classes!(
                                "btn",
                                if let Some(false) = setup.1 {
                                    "active"
                                } else {
                                    ""
                                }
                            )}
                            onclick={on_set_points.clone().reform(move |_| false)}
                        >
                            {"Tempo"}
                        </button>
                    </div>
                </div>
            </div>
        };
    }

    let setup = match *setup {
        (Some(single), Some(points)) => {
            if points {
                Some(GameSetup::Hits { single })
            } else {
                Some(GameSetup::Time { single })
            }
        }
        _ => None,
    };

    html! {
        <GameProvider init={setup.unwrap()}>
            <div class="p-2 flex flex-col gap-4 items-center">
                <button class="btn" onclick={on_reset_setup}>{"Voltar"}</button>
                <Players />
                <Board />
            </div>
        </GameProvider>
    }
}
