import ExerciseItem from './ExerciseItem';

function WorkoutSection({ section, checkedIds, onToggle, onPreview }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">{section.name}</h3>
        {section.description ? (
          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
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
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
          No checklist items in this section.
        </div>
      )}
    </section>
  );
}

export default WorkoutSection;
