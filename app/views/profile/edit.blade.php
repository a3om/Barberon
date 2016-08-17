@extends('main')
@section('wrapper')
<div id="content">
	<div class="editProfile">
		<div class="avatar"></div>
		<form class="information" id="editProfileInformationForm" method="post">
			<div class="field">
				<div class="title">Имя</div>
				<input type="text" name="name" autocomplete="off" placeholder="Ваше имя" value="{{ $user->name }}" />
				<div class="error">1</div>
			</div>
			<div class="field">
				<div class="title">О себе</div>
				<textarea name="about" placeholder="Расскажите немного о себе">{{ $user->about }}</textarea>
				<div class="error"></div>
			</div>
			<div class="field">
				<div class="title">E-Mail</div>
				<input type="text" name="email" autocomplete="off" placeholder="Ваш E-Mail" value="{{ $user->email }}" />
				<div class="error"></div>
			</div>
			<div class="title">Изменить пароль</div>
			<div class="field">
				<input type="password" name="oldPassword" autocomplete="off" placeholder="Старый пароль" />
				<div class="error"></div>
			</div>
			<div class="field">
				<input type="password" name="newPassword" autocomplete="off" placeholder="Новый пароль" />
				<div class="error"></div>
			</div>
			<div class="field">
				<input type="password" name="confirmationOfNewPassword" autocomplete="off" placeholder="Подтверждение нового пароля" />
				<div class="error"></div>
			</div>
			<div class="submit">
				<input type="submit" value="Сохранить" />
			</div>
			<span id="saveLoader" class="success">Идет сохранение...</span>
		</form>
	</div>
</div>
@stop