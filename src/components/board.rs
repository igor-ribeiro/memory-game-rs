use crate::{
    components::{card::Card, game_provider::GameContext},
    game::Action,
    hooks::use_reset_guess,
};
use yew::prelude::*;

#[function_component(Board)]
pub fn board() -> Html {
    let game = use_context::<GameContext>().unwrap();

    use_reset_guess();

    let board = game.cards.iter().enumerate().map(|(position, card)| {
        let on_flip = {
            let game = game.clone();
            Callback::from(move |pos: usize| game.dispatch(Action::FlipCard(pos)))
        };

        html! {
            <Card
                key={card.id}
                card={*card}
                {on_flip}
                {position}
            />
        }
    });

    html! {
        <div class="grid grid-cols-[repeat(6,100px)] gap-2">
            {for board}
        </div>
    }
}
