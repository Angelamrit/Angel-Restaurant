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
      <PageIntro eyebrow="In the press" title="A citywide" italic="conversation." description="Michelin recognition, and coverage from The New Yorker, Eater NY, The Infatuation, Condé Nast Traveller and more." mark="Press" />
      <section className="surface-dark tone-dark section" aria-label="Press coverage">
        <div className="container-shell press-list">
          <ol data-reveal data-stagger-children>
            {sorted.map((item, index) => (
              <li className="frame frame-strong frame-hover" key={item.url + item.title}>
                <article>
                  <span className="press-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="type-caption">
                      {item.outlet} · <time dateTime={item.date}>{formatDate(item.date)}</time>
                    </p>
                    <h2>
                      <a href={item.url}>{item.title} <span aria-hidden="true">↗</span></a>
                    </h2>
                    {item.note && <p>{item.note}</p>}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Reservation />
    </main>
  );
}
