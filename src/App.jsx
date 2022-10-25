import React, { useState } from "react";
import rn from "random-number";
import { useEffect } from "react";
import { Button, Container, Table, InputGroup, Form, Alert } from "react-bootstrap";

function App() {
	// const N = 20;
	const [request, setRequest] = useState({});
	const [granted, setGranted] = useState({});
	const [N, setNumProcesses] = useState(10);
	const [logs, setLogs] = useState([]);

	var token = 0;
	var turn = 0;

	const startProgram = () => {
		loadStates();
		setTimeout(threadRunner, 0);
	};

	useEffect(() => {
		// startProgram();
	}, []);

	useEffect(() => {
		console.log({ request });
	}, [request]);

	const threadRunner = () => {
		for (var i = 0; i < N; i++) {
			runAThread(i);
		}
	};

	const runAThread = (id) => {
		setTimeout(() => {
			const wait = rand();
			const critical = rand();
			// sleepWithExceptionHandling(wait);
			setTimeout(() => {
				console.log("Process " + id + " is requesting for resource");
				// request[id] = 1;
				console.log("request before setting it 1", request);
				setLogs((previousLogs) => [
					...previousLogs,
					"Process " + id + " is requesting for resource",
				]);
				// setRequest({ ...request, [id]: 1 });
				setRequest((previousRequest) => {
					return { ...previousRequest, [id]: 1 };
				});
				turn = 1 - turn;
				const x = turn;
				// granted[id] = 0;
				setGranted((previousGrant) => {
					return { ...previousGrant, [id]: 0 };
				});
				while (granted.id == 0) {
					if (token == 0) {
						token = 1;
						// granted[id] = 1;
						setGranted((previousGrant) => {
							return { ...previousGrant, [id]: 1 };
						});
					} else {
						if (request[1 - x] == 0) {
							turn = 1 - turn;
						} else {
							// request[id] = 0;
							// setRequest({ ...request, [id]: 0 });
							setRequest((previousRequest) => {
								return { ...previousRequest, [id]: 0 };
							});
							while (granted[1 - x] == 1) {
								if (turn == x) {
									// request[id] = 1;
									// setRequest({ ...request, [id]: 1 });
									setRequest((previousRequest) => {
										return { ...previousRequest, [id]: 1 };
									});
								}
							}
						}
					}
				}
				// TODO fix this
				// for (var i = 0; i < critical; i++) {
				// sleepWithExceptionHandling(1);
				// }
				setTimeout(() => {
					token = 0;
					// granted[id] = 0;
					setGranted((previousGrant) => {
						return { ...previousGrant, [id]: 0 };
					});
					// request[id] = 0;
					setRequest((previousRequest) => {
						return { ...previousRequest, [id]: 0 };
					});
					console.log("Process " + id + " has released resource");
					setLogs((previousLogs) => [
						...previousLogs,
						"Process " + id + " has released resource",
					]);
				}, critical);
			}, wait);
		}, rand());
	};

	const rand = () => {
		var options = {
			min: 0,
			max: 5000,
			integer: true,
		};
		return rn(options);
	};

	const loadStates = () => {
		clearStates();
		for (var i = 0; i < N - 1; i++) {
			setRequest((previousRequest) => {
				return { ...previousRequest, [i]: 0 };
			});
		}
		for (var i = 0; i < N - 1; i++) {
			setGranted((previousGrant) => {
				return { ...previousGrant, [i]: 1 };
			});
		}
	};

	const clearStates = () => {
		setRequest((previousRequest) => {
			return {};
		});
		setGranted((previousGrant) => {
			return {};
		});
	};

	const handleNumProcessChange = (event) => {
		setNumProcesses(parseInt(event.target.value) || 0);
	};

	return (
		<Container className="my-3">
			<h2>
				A visual representation of the Suzuki-Kasami's Broadcast Algorithm for implementing
				distributed mutual exclusion
			</h2>
			<InputGroup className="mb-3">
				<InputGroup.Text id="basic-addon1">Number of Processes</InputGroup.Text>
				<Form.Control
					placeholder="Number of Processes"
					aria-label="Number of Processes"
					aria-describedby="basic-addon1"
					value={N}
					onChange={handleNumProcessChange}
					autoFocus
				/>
				<Button onClick={startProgram}>Start Program</Button>
			</InputGroup>
			<Alert variant="primary">
				<p>Process Lifecycle:</p>
				<ol>
					<li>The processes start in a Normal state.</li>
					<li>Then a trigger to the Critical state happens automatically.</li>
					<li>
						Finally, they return back to the normal state after a few seconds of
						criticality.
					</li>
				</ol>
				<p>Like this: ✅ → ⏳ → ✅</p>
			</Alert>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Process Number</th>
						<th>Request Status</th>
					</tr>
				</thead>
				<tbody>
					{Object.keys(request).map((key) => (
						<tr key={key}>
							<td>{key}</td>
							<td>{request[key] === 0 ? "✅ Normal" : "⏳ Critical"}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Container>
	);
}

export default App;
