import React, { useState } from "react";
import rn from "random-number";
import { useEffect } from "react";
import { Button, Container, Table, InputGroup, Form, Alert, ProgressBar } from "react-bootstrap";

function App() {
	const [request, setRequest] = useState({});
	const [granted, setGranted] = useState({});
	const [N, setNumProcesses] = useState(10);
	const [logs, setLogs] = useState([]);
	const [progress, setProgress] = useState(0);

	var token = 0;
	var turn = 0;

	const startProgram = () => {
		loadStates();
		setTimeout(threadRunner, 0);
	};

	useEffect(() => {
		// log the request variable
		console.log({ request });

		// compute progress
		var tempProgress = 0;
		Object.keys(request).forEach((key) => {
			if (request[key] === 3) {
				tempProgress += 1;
			}
		});
		tempProgress = (tempProgress / N) * 100;
		setProgress(tempProgress);
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
			setTimeout(() => {
				console.log("Process " + id + " is requesting for resource");
				console.log("request before setting it 1", request);
				setLogs((previousLogs) => [
					...previousLogs,
					"Process " + id + " is requesting for resource",
				]);
				setRequest((previousRequest) => {
					return { ...previousRequest, [id]: 1 };
				});
				turn = 1 - turn;
				const x = turn;
				setGranted((previousGrant) => {
					return { ...previousGrant, [id]: 0 };
				});
				while (granted.id == 0) {
					if (token == 0) {
						token = 1;
						setGranted((previousGrant) => {
							return { ...previousGrant, [id]: 1 };
						});
					} else {
						if (request[1 - x] == 0) {
							turn = 1 - turn;
						} else {
							setRequest((previousRequest) => {
								return { ...previousRequest, [id]: 0 };
							});
							while (granted[1 - x] == 1) {
								if (turn == x) {
									setRequest((previousRequest) => {
										return { ...previousRequest, [id]: 1 };
									});
								}
							}
						}
					}
				}
				setTimeout(() => {
					token = 0;
					setGranted((previousGrant) => {
						return { ...previousGrant, [id]: 0 };
					});
					setRequest((previousRequest) => {
						return { ...previousRequest, [id]: 3 };
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
		setRequest(() => {
			return {};
		});
		setGranted(() => {
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
			{progress > 0 && (
				<ProgressBar className="my-3" animated now={progress} label={`${progress}%`} />
			)}
			<Alert variant="primary">
				<p>Process Lifecycle (✅ → ⏳ → 🏁):</p>
				<ol>
					<li>The processes start in a Normal state ✅</li>
					<li>Then a trigger to the Critical state happens automatically ⏳</li>
					<li>
						Finally, they return back to the non-Critcal state after a few random
						seconds of Criticality 🏁
					</li>
				</ol>
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
							<td>
								{request[key] === 0
									? "✅ Ready"
									: request[key] === 1
									? "⏳ Critical"
									: "🏁 Done"}
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Container>
	);
}

export default App;
