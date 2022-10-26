import React, { useState } from "react";
import rn from "random-number";
import { useEffect } from "react";
import {
	Button,
	Container,
	Table,
	InputGroup,
	Form,
	Alert,
	ProgressBar,
	FloatingLabel,
} from "react-bootstrap";

function App() {
	/**
	 * Stores the states of the processes.
	 * 0 - Ready
	 * 1 - Critical
	 * 3 - Done
	 */
	const [request, setRequest] = useState({});

	/**
	 * Says whether a process's critical request was granted or not.
	 * 0 - Not granted
	 * 1 - Granted
	 */
	const [granted, setGranted] = useState({});

	/**
	 * The number of processes to simulate the algorithm on.
	 */
	const [numProcesses, setNumProcesses] = useState(10);

	/**
	 * A variable used to store the progress of the algorithm execution.
	 */
	const [progress, setProgress] = useState(0);

	/**
	 * A recommended limit to the number of processes.
	 */
	const recommendedLimit = 50;

	var token = 0;
	var turn = 0;

	/**
	 * useEffect hook on the request variable in order to update the following:
	 * 1. Progressbar
	 */
	useEffect(() => {
		// compute progress
		var tempProgress = 0;
		Object.keys(request).forEach((key) => {
			if (request[key] === 3) {
				tempProgress += 1;
			}
		});
		tempProgress = (tempProgress / numProcesses) * 100;
		// Set a dummy progress value in order to start the process and also disable the buttons and inputs
		if (tempProgress === 0 && Object.keys(request).length > 0) {
			tempProgress = 5;
		}
		setProgress(tempProgress);
	}, [request]);

	/**
	 * The main method that invokes the program execution. This method is invoked using a button in the GUI.
	 */
	const startProgram = () => {
		loadStates();
		threadRunner();
	};

	/**
	 * This function starts N number of processes as defined in the numProcesses variable.
	 */
	const threadRunner = () => {
		for (var i = 0; i < numProcesses; i++) {
			runAThread(i);
		}
	};

	/**
	 * This starts a single process with a thread id "i", where i is provided by the threadRunner method.
	 * @param {*} id
	 */
	const runAThread = (id) => {
		setTimeout(() => {
			const wait = rand();
			const critical = rand();
			setTimeout(() => {
				console.log("Process " + id + " is requesting for resource");
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
				}, critical);
			}, wait);
		}, rand());
	};

	/**
	 * A random number generator to help with generating random times in milliseconds.
	 * @returns a random time between 0 & 5000 milliseconds.
	 */
	const rand = () => {
		var options = {
			min: 0,
			max: 5000,
			integer: true,
		};
		return rn(options);
	};

	/**
	 * Prefills data for all the state variables.
	 */
	const loadStates = () => {
		clearStates();
		for (var i = 0; i < numProcesses - 1; i++) {
			setRequest((previousRequest) => {
				return { ...previousRequest, [i]: 0 };
			});
		}
		for (var i = 0; i < numProcesses - 1; i++) {
			setGranted((previousGrant) => {
				return { ...previousGrant, [i]: 1 };
			});
		}
	};

	/**
	 * Resets all the state variable data.
	 */
	const clearStates = () => {
		setRequest(() => {
			return {};
		});
		setGranted(() => {
			return {};
		});
		setProgress(() => {
			return 0;
		});
	};

	/**
	 * Handle the change in the input box that stores the number of processes that need to be demonstrated.
	 * @param {*} event
	 */
	const handleNumProcessChange = (event) => {
		setNumProcesses(parseInt(event.target.value) || 0);
	};

	/**
	 * Says whether the inputs need to be disabled or not.
	 * We disable the inputs if the program is in progress.
	 * @returns
	 */
	const disableButtons = () => {
		return progress != 0 && progress != 100;
	};

	/**
	 * A little validation to warn the user from
	 * not entering large values for the number of processes.
	 * @returns
	 */
	const isInputInvalid = () => {
		return numProcesses > recommendedLimit;
	};

	return (
		<Container className="my-3">
			<h2>
				A visual representation of the Suzuki-Kasami's Broadcast Algorithm for implementing
				distributed mutual exclusion
			</h2>
			<InputGroup className="mb-3">
				<FloatingLabel controlId="floatingInput" label="Number of Processes">
					<Form.Control
						placeholder="Number of Processes"
						aria-label="Number of Processes"
						aria-describedby="basic-addon1"
						value={numProcesses}
						onChange={handleNumProcessChange}
						autoFocus
						disabled={disableButtons()}
						isInvalid={isInputInvalid()}
					/>
					<Form.Control.Feedback type="invalid">
						{`Don't destroy your device! It is recommended to try something lesser than
						${recommendedLimit}.`}
					</Form.Control.Feedback>
				</FloatingLabel>
				<Button onClick={startProgram} disabled={disableButtons()}>
					Start Program
				</Button>
			</InputGroup>
			{progress > 0 && (
				<ProgressBar className="my-3" animated now={progress} label={`${progress}%`} />
			)}
			<Alert variant="primary">
				<p>Process Lifecycle (✅ → ⚠ → 🏁):</p>
				<ol>
					<li>The processes start in a Normal state ✅</li>
					<li>Then a trigger to the Critical state happens automatically ⚠</li>
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
									? "⚠ Critical"
									: "🏁 Done"}
							</td>
						</tr>
					))}
				</tbody>
			</Table>
			<p>
				An assignment submission by Anu Shibin J (2022MT12007). Fork this project on my{" "}
				<a href="https://github.com/anushibin007/suzuki-kasami-visualized" target="_blank">
					my GitHub
				</a>
				.
			</p>
		</Container>
	);
}

export default App;
