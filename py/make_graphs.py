import plotly.graph_objects as go
import plotly.express as px


class Records:
    def __init__(self):
        self.ids = []
        self.endtimes = []
        self.latencies = []


def get_records(path: str) -> Records:
    records = Records()

    with open('../results/' + path) as file:
        for line in file:
            line = line.strip()
            if line == '':
                continue
            endtime, latency, id = line.split(',')
            records.ids.append(int(id))
            records.endtimes.append(int(endtime))
            records.latencies.append(int(latency))

    return records


def write_latency_graph(sample_name: str, records: dict):
    fig = px.scatter(records, x='ids', y='latencies')
    fig.write_html(f'../results/{sample_name}-latencies.html')


def write_endtime_graph(sample_name: str, records: dict):
    fig = px.scatter(records, x='ids', y='endtimes')
    fig.write_html(f'../results/{sample_name}-endtimes.html')


def write_latency_over_time_graph(sample_name: str, records: dict):
    fig = px.scatter(records, x='endtimes', y='latencies')
    fig.write_html(f'../results/{sample_name}-latency_over_time.html')


def make_graphs(sample_name: str):
    records = get_records(f'{sample_name}.txt')
    records = {'ids': records.ids, 'endtimes': records.endtimes, 'latencies': records.latencies}
    write_latency_graph(sample_name, records)
    write_endtime_graph(sample_name, records)
    write_latency_over_time_graph(sample_name, records)


def main():
    make_graphs('1000q-10H-1')


if __name__ == '__main__':
    main()
