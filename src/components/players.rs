use crate::{components::game_provider::GameContext, game::ScoreType};
use yew::prelude::*;

#[function_component(Players)]
pub fn players() -> Html {
    let game = use_context::<GameContext>().unwrap();

    let players = game.players.iter().enumerate().map(|(i, player)| {
        let is_turn = game.turn == i;

        let points = if let ScoreType::Time { started_at } = game.points_type {
            if started_at.is_some() && is_turn {
                "...".to_string()
            } else {
                format!("{}s", player.points)
            }
        } else {
            format!("{}", player.points)
        };

        html! {
            <div
                key={player.name}
                class={classes!(
                    "font-black text-center flex flex-col justify-between relative overflow-hidden p-1".to_string(),
                    is_turn.then_some("bg-yellow-200"),
                )}
            >
                <span class="uppercase text-sm">
                    {player.name}
                </span>

                <span
                    key={player.points}
                    class="text-3xl animate-[ping_.7s_ease-in-out_1] [animation-direction:reverse]"
                >
                    {points}
                </span>
            </div>
        }
    });

    html! {
        <div class="flex flex-col w-full gap-2 rounded cartoon bg-green-200">
            {for players}
        </div>
    }
}
