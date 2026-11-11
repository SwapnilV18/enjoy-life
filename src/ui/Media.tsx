const base = import.meta.env.BASE_URL;
export const mediaFrames = (id: string): [string, string] => [`${base}media/${id}-0.jpg`, `${base}media/${id}-1.jpg`];

/** Two photos of the movement (start / end position) crossfading in a loop. */
export function ExerciseMedia({ id, name }: { id: string; name: string }) {
  const [a, b] = mediaFrames(id);
  return (
    <div class="media">
      <img src={a} alt={`${name} start position`} loading="eager" />
      <img class="alt" src={b} alt={`${name} end position`} loading="eager" />
    </div>
  );
}
