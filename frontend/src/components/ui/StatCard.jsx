export default function StatCard({ title, value, sub }) {
	return (
		<div className="bg-card rounded-xl p-6 transition glass hover:scale-105 duration-200 !shadow-lg">
			<p className="text-sm text-textSecondary">{title}</p>
			<h2 className="text-3xl font-bold mt-4">{value}</h2>
			<p className="text-xs text-textSecondary mt-1">{sub}</p>
		</div>
	);
}
