pub fn is_option_value<T: PartialEq>(value: Option<T>, option: T) -> bool {
    value.map(|v| v == option).unwrap_or_default()
}
