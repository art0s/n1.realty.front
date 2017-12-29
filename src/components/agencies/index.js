///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import axios from 'axios';
import * as CONSTANTS from '../../config';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import loadIcon from '../../asset/img/loading-hor16.gif';
import './style.scss';
///////////////////////////////////////////////////////////////////////////////
class Agencies extends Component {
	//=========================================================================
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			records: []
		};
	}

	//=========================================================================
	componentDidMount() {
		axios.get(CONSTANTS.API_URL + '/agencies/' + CONSTANTS.CITY_ID)
			.then(response => {
				this.setState({ records: response.data });
			})
			.catch(error => {
				this.setState({ records: [] });
			})
			.then(() => {
				this.setState({ loading: false });
			});
	}

	//=========================================================================
	render() {
		if (this.state.loading || !this.state.records.length)
		{
			return (
				<div className="page-content">
					<h2>Агентства представленные на портале</h2>

					<div className="load-block">
						<img src={loadIcon} alt="Загрузка данных..." />
					</div>
				</div>
			);
		}
		else
		{
			return (
				<div className="page-content">
					<h2>Агентства представленные на портале</h2>

					<Table>
						<TableHeader adjustForCheckbox={false} displaySelectAll={false}>
							<TableRow>
								<TableHeaderColumn>Наименование</TableHeaderColumn>
								<TableHeaderColumn>Сайт</TableHeaderColumn>
								<TableHeaderColumn>Телефон</TableHeaderColumn>
							</TableRow>
						</TableHeader>
						<TableBody displayRowCheckbox={false}>
						{this.state.records.map((record) => {
							return (
								<TableRow selectable={false} key={record.id}>
									<TableRowColumn>{record.name}</TableRowColumn>
									<TableRowColumn><a href={'http://' + record.url} target="_blank">{record.url}</a></TableRowColumn>
									<TableRowColumn>{record.phones}</TableRowColumn>
								</TableRow>
							);
						})}
						</TableBody>
					</Table>
				</div>
			);
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default Agencies;
///////////////////////////////////////////////////////////////////////////////