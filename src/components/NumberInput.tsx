interface NumberInputProps {
  value: number;
  setValue: (value: number) => void;
  width: number;
  label: string;
}

export function NumberInput(props: NumberInputProps) {
  return (
    <label>
      {props.label}:
      <input
        type="number"
        style={{ width: props.width + 'em' }}
        placeholder={props.label}
        value={props.value}
        onInput={(e) => {
          if (e.currentTarget.valueAsNumber) {
            props.setValue(e.currentTarget.valueAsNumber);
          }
        }}
      />
    </label>
  );
}
