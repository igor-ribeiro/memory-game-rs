use rand::prelude::*;
use std::rc::Rc;
use yew::Reducible;

#[derive(Default, Clone, Copy, Debug, Eq)]
pub struct Card {
    pub id: i32,
    pub value: i32,
    pub flipped: bool,
}

impl PartialEq for Card {
    fn eq(&self, other: &Self) -> bool {
        self.value == other.value
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Player {
    pub name: &'static str,
    pub points: i32,
}

impl Player {
    fn new(name: &'static str) -> Self {
        Self { name, points: 0 }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Game {
    pub guess: (Option<usize>, Option<usize>),
    pub turn: usize,
    pub players: Vec<Player>,
    pub cards: Vec<Card>,
}

pub enum Action {
    FlipCard(usize),
    NextTurn,
}

impl Reducible for Game {
    type Action = Action;

    fn reduce(self: Rc<Self>, action: Self::Action) -> Rc<Self> {
        let mut state = self.as_ref().clone();

        let next = match action {
            Action::FlipCard(position) => {
                let card = &state.cards[position];

                if card.flipped {
                    return self;
                }

                match state.guess {
                    (None, None) => {
                        state.guess.0 = Some(position);
                        let card = &mut state.cards[position];
                        card.flipped = true;
                    }
                    (Some(first_pos), None) => {
                        let first_value = state.cards[first_pos].value;
                        let second = &mut state.cards[position];
                        let player = &mut state.players[self.turn];

                        second.flipped = true;

                        if first_value == second.value {
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
                if let (Some(first_pos), Some(second_pos)) = state.guess {
                    state.guess = (None, None);
                    state
                        .cards
                        .iter_mut()
                        .enumerate()
                        .filter(|(pos, _)| *pos == first_pos || *pos == second_pos)
                        .for_each(|(_, card)| {
                            card.flipped = false;
                        });
                };

                state
            }
        };

        next.into()
    }
}

impl Game {
    pub fn new() -> Self {
        let mut cards = (1..=24)
            .map(|value| Card {
                id: value,
                value: (value as f32 / 2.0).ceil() as i32,
                flipped: false,
            })
            .collect::<Vec<Card>>();

        let mut rng = rand::thread_rng();

        cards.shuffle(&mut rng);

        Self {
            guess: (None, None),
            players: vec![Player::new("Player 1"), Player::new("Player 2")],
            turn: 0,
            cards,
        }
    }
}
