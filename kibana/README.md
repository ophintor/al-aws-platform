Source of scripts: https://github.com/elastic/beats-dashboards

To upgrade dashboards, visualisations and searches:
- open kibana
- do your changes
- execute on your local machine:
./kibana_dump.py --url https://url-to-kibana.region.es.amazonaws.com --dir dashboards
- commit & push