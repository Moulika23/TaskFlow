/*
  components/Avatar.jsx — Displays user initials in a colored circle

  WHY A SEPARATE COMPONENT?
  We show member avatars in project cards, the workspace, and the navbar.
  Rather than copy-pasting the same div 3+ times, we define it once here.
  This is the DRY principle in action on the frontend.

  HOW THE COLOR IS PICKED:
  We take the first character of the name, get its character code (a number),
  then use modulo (%) to pick from our color array. This means the same name
  always gets the same color — it's deterministic, not random.
  "Alice" → charCode 65 → 65 % 6 = 5 → always bg-pink-500
*/

const COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-pink-500',
]

function Avatar({ name = '?', size = 'md' }) {
  // Get up to 2 initials: "Alice Smith" → "AS", "Bob" → "B"
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Pick a consistent color based on the first character
  const colorClass = COLORS[name.charCodeAt(0) % COLORS.length]

  const sizeClass =
    size === 'sm' ? 'w-7 h-7 text-xs' :
    size === 'md' ? 'w-9 h-9 text-sm' :
    size === 'lg' ? 'w-24 h-24 text-2xl' :
    'w-11 h-11 text-base'

  return (
    <div
      className={`${colorClass} ${sizeClass} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      title={name}
    >
      {initials}
    </div>
  )
}

export default Avatar
