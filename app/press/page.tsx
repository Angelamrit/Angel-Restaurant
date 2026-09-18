import { PageIntro, Reservation } from "@/components/editorial";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";
import { press } from "@/lib/press";

export const metadata = pageMetadata({
  title: "Press & Recognition",
  description:
    "Michelin Bib Gourmand and coverage of Angel Indian Restaurant in The New Yorker, Eater NY, The Infatuation, Condé Nast Traveller and more.",
  path: "/press",
});
const breadcrumbs = breadcrumbList([{ name: "Press", path: "/press" }]);

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date));
}

export default function PressPage() {
  const sorted = [...press].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <PageIntro eyebrow="In the press" title="A citywide" italic="conversation." description="Michelin recognition, and coverage from The New Yorker, Eater NY, The Infatuation, Condé Nast Traveller and more." />
      <section className="press-list container-shell" aria-label="Press coverage">
        <ol>
          {sorted.map((item) => (
            <li key={item.url + item.title}>
              <article>
                <p className="type-caption">
                  {item.outlet} · <time dateTime={item.date}>{formatDate(item.date)}</time>
                </p>
                <h2>
                  <a href={item.url}>{item.title} <span aria-hidden="true">↗</span></a>
                </h2>
                {item.note && <p>{item.note}</p>}
              </article>
            </li>
          ))}
        </ol>
      </section>
      <Reservation />
    </main>
  );
}
