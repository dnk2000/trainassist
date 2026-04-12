import ExerciseItem from './ExerciseItem';

function WorkoutSection({ section, checkedIds, onToggle, onPreview }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/15">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{section.name}</h3>
        {section.description ? (
          <p className="mt-1 text-sm text-slate-400">{section.description}</p>
        ) : null}
      </div>

      {section.items.length ? (
        <ul className="space-y-3">
          {section.items.map((item) => (
            <ExerciseItem
              key={item.id}
              exercise={item}
              checked={checkedIds.has(item.id)}
              onToggle={onToggle}
              onPreview={onPreview}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
          No checklist items in this section.
        </div>
      )}
    </section>
  );
}

export default WorkoutSection;
