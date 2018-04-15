///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import InputMask from 'react-input-mask';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import RefreshIndicator from 'material-ui/RefreshIndicator';
///////////////////////////////////////////////////////////////////////////////
import axios from 'axios';
import * as CONSTANTS from '../../config';
import './style.scss';
///////////////////////////////////////////////////////////////////////////////
class Contact extends Component {
	//=========================================================================
	constructor(props){
		//---------------------------------------------------------------------
		super(props)

		//---------------------------------------------------------------------
		this.state = {
			loading: false,
			snackBar: { isOpen: false, message: '' },
			region: {
				value: '',
				error: ''
			},
			company: {
				value: '',
				error: ''
			},
			post: {
				value: '',
				error: ''
			},
			name: {
				value: '',
				error: ''
			},
			phone: {
				value: '',
				floatingLabelFixed: false,
				error: ''
			},
			email: {
				value: '',
				error: ''
			},
			site: {
				value: '',
				error: ''
			},
			fzConfirm: true
		};

		//---------------------------------------------------------------------
		this.onFieldChange = field => {
			return (event) => {
				let _value = event && event.target && event.target.value ? event.target.value : '';
				let _state = {};
				_state[field] = {
					value: _value,
					error: ''
				};

				this.setState(_state);
			}
		}

		//---------------------------------------------------------------------
		this.onPhoneChange = event => {
			let _value = event && event.target && event.target.value ? event.target.value : '';
			let _floatingLabelFixed = !!_value;
			this.setState({
				phone: {
					value: _value,
					floatingLabelFixed: _floatingLabelFixed,
					error: ''
				}
			});
		}

		//---------------------------------------------------------------------
		this.clearFields = () => {
			// очищаем поля
			this.setState({
				region: {
					value: '',
					error: ''
				},
				company: {
					value: '',
					error: ''
				},
				post: {
					value: '',
					error: ''
				},
				name: {
					value: '',
					error: ''
				},
				phone: {
					value: '',
					floatingLabelFixed: false,
					error: ''
				},
				email: {
					value: '',
					error: ''
				},
				site: {
					value: '',
					error: ''
				},
				fzConfirm: false
			});
		}

		//---------------------------------------------------------------------
		this.sendData = event => {
			// проверки полей
			let _errors = {};

			// 1. регион
			if (!this.state.region.value)
			{
				_errors['region'] = 'Пожалуйста, укажите ваш регион';
			}
			// 2. компания
			if (!this.state.company.value)
			{
				_errors['company'] = 'Пожалуйста, укажите название компании';
			}
			// 3. должность
			if (!this.state.post.value)
			{
				_errors['post'] = 'Пожалуйста, укажите вашу должность';
			}
			// 4. наименование
			if (!this.state.name.value)
			{
				_errors['name'] = 'Пожалуйста, укажите как к вам обращаться';
			}
			// 5. телефон
			if (!this.state.phone.value)
			{
				_errors['phone'] = 'Пожалуйста, укажите ваш телефон';
			}
			else
			{
				if (!/^\+7\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}$/.test(this.state.phone.value))
					_errors['phone'] = 'Указан неправильный телефон';
			}
			// 6. email
			if (!this.state.email.value)
			{
				_errors['email'] = 'Пожалуйста, укажите ваш E-mail';
			}
			else
			{
				let _email = String(this.state.email.value);
				if (_email.length === 0) _errors['email'] = 'Пожалуйста, укажите ваш E-mail';
				else if (_email.indexOf('@') === -1) _errors['email'] = 'Указан неправильный E-mail';
				else
				{
					// eslint-disable-next-line
					var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					if (!re.test(_email)) _errors['email'] = 'Указан неправильный E-mail';
				}
			}
			// 7. сайт
			if (!this.state.site.value)
			{
				_errors['site'] = 'Пожалуйста, укажите сайт компании'
			}

			// если есть какие то ошибки
			if (Object.keys(_errors).length)
			{
				let _state = {};
				for (let _field in _errors) if (_errors.hasOwnProperty(_field))
				{
					_state[_field] = {
						value: this.state[_field].value,
						error: _errors[_field]
					}
				}

				return this.setState(_state);
			}

			// производим запрос
			this.setState({ loading: true });
			// запрос списка объектов - первый GET-запрос на получение CSRF
			axios.get(CONSTANTS.API_URL + '/contact/' + CONSTANTS.CITY_ID)
			.then(response => {
				// если пришли корректные данные
				if (response.data && String(response.data).trim() !== '' && String(response.data).indexOf('!') > -1)
				{
					// делаем воторой POST-запрос
					axios.post(CONSTANTS.API_URL + '/contact/' + CONSTANTS.CITY_ID, {
						vr: response.data,
						region: this.state.region.value,
						company: this.state.company.value,
						post: this.state.post.value,
						name: this.state.name.value,
						phone: this.state.phone.value,
						email: this.state.email.value,
						site: this.state.site.value
					})
					.then(response => {
						if (response.data && String(response.data) === 'ok')
						{
							this.setState({ snackBar: { isOpen: true, message: 'Контакты успешно отправлены, мы свяжемся с вами в ближайшее время!' } });
							this.clearFields();
							this.setState({ loading: false });
						}
						else
						{
							this.setState({ snackBar: { isOpen: true, message: 'Извините, произошла ошибка запроса...' } });
							this.setState({ loading: false });
						}
					})
					.catch(() => {
						this.setState({ snackBar: { isOpen: true, message: 'Извините, произошла ошибка запроса...' } });
						this.setState({ loading: false });
					});
				}
				else
				{
					this.setState({ snackBar: { isOpen: true, message: 'Извините, произошла ошибка запроса...' } });
					this.setState({ loading: false });
				}
			})
			.catch(() => {
				this.setState({ snackBar: { isOpen: true, message: 'Извините, произошла ошибка запроса...' } });
				this.setState({ loading: false });
			});			
		}

		//---------------------------------------------------------------------
	}

	//=========================================================================
	render() {
		return (
			<div className="page-content contact">

				<div className="contact-block">
					<h2>N1.realty - единый риелторский сайт {CONSTANTS.CITY_NAME_2}</h2>

					<div className="info">
					<p className="info-header">Уважаемые <strong>руководители агентств</strong> недвижимости!</p>

					<p className="info-notes">Мы готовы приложить максимум усилий для того,
					что бы вы выбрали нас в качестве рекламной площадки
					для ваших объектов недвижимости.
					<br/><br/>
					Заполните форму для получения подробной информации.</p>
					</div>
					
					<TextField
						hintText="Укажите город в котором вы ведете бизнес"
						floatingLabelText={ <span>Регион <span style={{ color: 'red' }}>*</span></span> }
						fullWidth={ true }
						value={ this.state.region.value }
						errorText={ this.state.region.error }
						onChange={ this.onFieldChange('region') }
						onFocus={ this.onFieldChange('region') }
					/>
					<TextField
						floatingLabelText={ <span>Название компании <span style={{ color: 'red' }}>*</span></span> }
						fullWidth={ true }
						value={ this.state.company.value }
						errorText={ this.state.company.error }
						onChange={ this.onFieldChange('company') }
						onFocus={ this.onFieldChange('company') }
					/>
					<TextField
						floatingLabelText={ <span>Должность <span style={{ color: 'red' }}>*</span></span> }
						fullWidth={ true }
						value={ this.state.post.value }
						errorText={ this.state.post.error }
						onChange={ this.onFieldChange('post') }
						onFocus={ this.onFieldChange('post') }
					/>
					<TextField
						floatingLabelText={ <span>Имя <span style={{ color: 'red' }}>*</span></span> }
						fullWidth={ true }
						value={ this.state.name.value }
						errorText={ this.state.name.error }
						onChange={ this.onFieldChange('name') }
						onFocus={ this.onFieldChange('name') }
					/>
					<TextField
						floatingLabelText={ <span>Телефон для связи <span style={{ color: 'red' }}>*</span></span> }
						fullWidth={ true }
						value={ this.state.phone.value }
						errorText={ this.state.phone.error }
						onChange={ this.onPhoneChange }
						onFocus={ this.onPhoneChange }
						floatingLabelFixed={ this.state.phone.floatingLabelFixed }
					>
						<InputMask value={ this.state.phone.value } mask="+7 (999) 999 99 99" alwaysShowMask={false} />
					</TextField>
					<TextField
						hintText="my-email@example.com"
						floatingLabelText={ <span>E-mail <span style={{ color: 'red' }}>*</span></span> }
						fullWidth={ true }
						value={ this.state.email.value }
						errorText={ this.state.email.error }
						onChange={ this.onFieldChange('email') }
						onFocus={ this.onFieldChange('email') }
					/>
					<TextField
						hintText="http://"
						floatingLabelText={ <span>Сайт компании <span style={{ color: 'red' }}>*</span></span> }
						fullWidth={ true }
						value={ this.state.site.value }
						errorText={ this.state.site.error }
						onChange={ this.onFieldChange('site') }
						onFocus={ this.onFieldChange('site') }
					/>
					
					<div className="checkbox-152-fz">
						<Checkbox
							label="Нажимая кнопку «Отправить», я даю свое согласие на обработку моих персональных данных, в соответствии с Федеральным законом от 27.07.2006 года №152-ФЗ «О персональных данных», на условиях и для целей, определенных в Согласии на обработку персональных данных"
							checked={ this.state.fzConfirm }
							onCheck={ (obj, val) => this.setState({ fzConfirm: val }) }
						/>

						<RaisedButton
							label="Отправить"
							primary={ true }
							style={ { marginTop: '40px' } }
							disabled={ !this.state.fzConfirm || this.state.loading }
							onClick={ this.sendData }
						/>

						<RefreshIndicator
							size={ 40 }
							left={ 10 }
							top={ 10 }
							status="loading"
							style={ { display: this.state.loading ? 'inline-block' : 'none', position: 'relative' } }
						/>
					</div>
					<br/>

				</div>

				 <Snackbar
					open={ this.state.snackBar.isOpen }
					message={ this.state.snackBar.message }
					autoHideDuration={ 4000 }
					onRequestClose={ () => this.setState({ snackBar: { isOpen: false, message: '' } }) }
				/>
			</div>
		);
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default Contact;
///////////////////////////////////////////////////////////////////////////////