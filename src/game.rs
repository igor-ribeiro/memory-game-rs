use rand::prelude::*;
use std::{collections::HashMap, rc::Rc};
use yew::Reducible;

#[derive(Default, Clone, Copy, Debug, Eq)]
pub struct Card {
    pub id: i32,
    pub value: i32,
    pub opened: bool,
}

impl PartialEq for Card {
    fn eq(&self, other: &Self) -> bool {
        self.value == other.value
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Player<'a> {
    pub name: &'a str,
    pub points: i32,
}

impl<'a> Player<'a> {
    fn new(name: &'a str) -> Self {
        Self { name, points: 0 }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Game<'a> {
    pub guess: (Option<usize>, Option<usize>),
    pub opened: HashMap<usize, bool>,
    pub turn: usize,
    pub players: Vec<Player<'a>>,
    pub cards: Vec<Card>,
}

pub enum Action {
    OpenCard(usize),
    NextTurn,
}

impl<'a> Reducible for Game<'a> {
    type Action = Action;

    fn reduce(self: Rc<Self>, action: Self::Action) -> Rc<Self> {
        let mut state = self.as_ref().clone();

        let next = match action {
            Action::OpenCard(position) => {
                if self.opened.contains_key(&position) {
                    return self;
                }

                match state.guess {
                    (None, None) => state.guess.0 = Some(position),
                    (Some(first_pos), None) => {
                        let first = self.cards[first_pos];
                        let second = self.cards[position];
                        let player = &mut state.players[self.turn];

                        if first == second {
                            state.opened.insert(first_pos, true);
                            state.opened.insert(position, true);
                            player.points += 2;
                            state.guess = (None, None);
                        } else {
                            state.guess.1 = Some(position);
                            state.turn = (state.turn + 1) % self.players.len();
                        }
                    }
                    _ => {}
                };

                state
            }
            Action::NextTurn => {
                if state.guess.0.is_some() && state.guess.1.is_some() {
                    state.guess = (None, None);
                }

                state
            }
        };

        next.clone().into()
    }
}

impl<'a> Game<'a> {
    pub fn new() -> Self {
        let mut cards = (1..=12)
            .map(|value| Card {
                id: value,
                value: (value as f32 / 2.0).ceil() as i32,
                opened: false,
            })
            .collect::<Vec<Card>>();

        let mut rng = rand::thread_rng();

        cards.shuffle(&mut rng);

        Self {
            guess: (None, None),
            opened: HashMap::new(),
            players: vec![Player::new("Player 1"), Player::new("Player 2")],
            turn: 0,
            cards,
        }
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn it_works() {
        // let mut game = super::Game::new();
        //
        // game.open_card(0);
        //
        // let first = game.get_card(game.opened[0].unwrap());
        // assert_eq!(first.value, 1);
        // assert_eq!(game.opened[1], None);
        //
        // game.open_card(1);
        //
        // let first = game.get_card(game.opened[0].unwrap());
        // let second = game.get_card(game.opened[1].unwrap());
        // assert_eq!(first.value, 1);
        // assert_eq!(second.value, 1);
        //
        // let last_turn = game.turn;
        //
        // game.update();
        // assert_eq!(game.opened, [None, None], "reset temporary opened cards");
        //
        // let last_playex = game.players[last_turn];
        // assert_eq!(last_player.points, 2);
        //
        // let opened_cards = game
        //     .cards
        //     .iter()
        //     .filter(|card| card.opened)
        //     .collect::<Vec<_>>();
        // assert_eq!(opened_cards.len(), 2);
        //
        // game.open_card(2);
        //
        // let first = game.get_card(game.opened[0].unwrap());
        // assert_eq!(first.value, 2, "correct guess, +2 points");
        // assert_eq!(game.opened[1], None);
        //
        // game.open_card(4);
        //
        // let first = game.get_card(game.opened[0].unwrap());
        // let second = game.get_card(game.opened[1].unwrap());
        // assert_eq!(first.value, 2);
        // assert_eq!(second.value, 3);
        //
        // let last_turn = game.turn;
        //
        // game.update();
        // assert_eq!(game.opened, [None, None]);
        //
        // let last_player = game.players[last_turn];
        // assert_eq!(last_player.points, 0, "wrong choice, no points");
        //
        // let opened_cards = game
        //     .cards
        //     .iter()
        //     .filter(|card| card.opened)
        //     .collect::<Vec<_>>();
        // assert_eq!(
        //     opened_cards.len(),
        //     2,
        //     "wrong guess, no no additional opened cards"
        // );
    }
}
