<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/js/jquery-ui.min.css">
    <script src="/js/jquery.js"></script>
    <script src="/js/jquery.unparam.js"></script>
    <script src="/js/jquery-ui.min.js"></script>
    <script src="/js/underscore.js"></script>
    <script src="/js/backbone.js"></script>
    <script src="/js/moment.js"></script>
    <script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU"></script>
    <script src="/js/application.js"></script>
    <script>
    moment.locale('ru');
    App.State.Account =
    {
        loggedIn: {{ Auth::check() ? 'true' : 'false' }},
        user: {{ Auth::check() ? json_encode(array_merge(Auth::user()->toArray(), ['pointSubscriptionsCount' => $pointSubscriptionsCount])) : 'null' }},
    };
    </script>
</head>
<body>
    <script type="text/template" id="headerTemplate">
        <% if (history) { %>
            <a class="leftside" id="backButton" href="#<%- history.path %>">
                &lsaquo; <%- history.title %>
            </a>
         <% } %>
        <a href="/" class="logo">
            <img src="/img/logoPrototype.png" alt="" />
        </a>
        <div class="rightside">
            <% if (!account.check()) { %>
            <a class="item" id="loginButton">Войти</a>
            <a class="item" id="registerButton">Зарегистрироваться</a>
            <% } else { %>
            <a class="profile" id="profileButton">
                <div class="name"><%- account.user.name %></div>
                <div class="avatar">
                    <img src="https://pbs.twimg.com/profile_images/572360620519878656/tMFYl1Re_400x400.jpeg" alt="" />
                </div>
            </a>
            <% } %>
        </div>
        <% if (account.check()) { %>
        <div class="menu">
            <a href="/edit">Редактировать</a>
            <a href="/profile/points">Мои точки<span id="subscribedPointsCount"><%- account.user.pointSubscriptionsCount %></span></a>
            <a id="logoutButton">Выход</a>
        </div>
        <% } %>
    </script>
    <script type="text/template" id="authorizeModalTemplate">
        <div class="overlay"></div>
        <div class="content">
            <div class="authorize">
                <div class="title">Авторизация</div>
                <form class="block" id="loginForm">
                    <div class="input">
                        <input type="text" name="email" placeholder="E-Mail" autocomplete="off" />
                        <div class="error"></div>
                    </div>
                    <div class="input">
                        <input type="password" name="password" placeholder="Ваш пароль" autocomplete="off" />
                        <div class="error"></div>
                    </div>
                    <input type="submit" class="submit" value="Войти" />
                </form>
                <form class="block" id="registrationForm">
                    <div class="input">
                        <input type="text" name="name" placeholder="Ваше имя" autocomplete="off" />
                        <div class="error"></div>
                    </div>
                    <div class="input">
                        <input type="text" name="email" placeholder="E-Mail" autocomplete="off" />
                        <div class="error"></div>
                    </div>
                    <div class="input">
                        <input type="password" name="password" placeholder="Ваш пароль" autocomplete="off" />
                        <div class="error"></div>
                    </div>
                    <input type="submit" class="submit" value="Зарегистрироваться" />
                </form>
            </div>
        </div>
    </script>
    <!-- [ Search ] -->
    <script type="text/template" id="searchTemplate">
        <div id="topbar">
            <form class="search" id="searchForm">
                <input type="text" name="query" autocomplete="off" id="query" placeholder="Введите название" value="<%- query.query %>" />
                <img src="/img/searchLoader.gif" alt="" id="searchLoader" />
            </form>
        </div>
        <div id="sidebar">
            <div class="dropdown">
                <div class="title">
                    <span id="searchByTitle"><%- searchTitle %></span>
                    <span>&#9660;</span>
                </div>
                <ul>
                    <li>Поиск точек</li>
                    <li>Поиск услуг</li>
                    <li>Поиск акций</li>
                </ul>
                <input type="hidden" name="searchBy" id="searchBy" value="name" />
            </div>
            <div class="options">
                <div class="title">Сортировка</div>
                <div class="separator"></div>
                <div class="content">
                    <div class="sorter">
                        <div class="title">
                            <span id="sortingByTitle"><%- sortTitle %></span>
                            <span>&#9660;</span>
                        </div>
                        <div class="order"><%= (order == 'desc') ? '&darr;' : '&uarr;' %></div>
                        <ul>
                            <li>По рейтингу</li>
                            <li>По расстоянию</li>
                        </ul>
                    </div>
                </div>
                <div id="servicesPriceFilter" <%= (servicesPriceFilter) ? 'style="display: none;"' : '' %>>
                    <div class="separator"></div>
                    <div class="title">Стоимость услуги</div>
                    <div class="separator"></div>
                    <div class="content">
                        <div class="filter">
                            <input type="text" name="from" class="from" placeholder="От..." autocomplete="off" id="filterPriceFrom" value="{{ Input::get('priceFrom') }}" /><input type="text" name="to" class="to" placeholder="До..." autocomplete="off" id="filterPriceTo" value="{{ Input::get('priceTo') }}" />
                            <div id="slider-range"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="scroll">
                <div class="border"></div>
                <div class="arrow"></div>
            </div>
        </div>
        <div id="content" class="withSidebar withTopbar"></div>
    </script>
    <script type="text/template" id="searchUnitTemplate">
        <% if (type == 'points') { %>
            <a class="point" href="/<%= unit.profile.address %>">
                <div class="logo">
                    <img src="/img/testLogo.jpg" alt="" />
                </div>
                <div class="info">
                    <div class="name"><%= unit.name %></div>
                    <div class="rating"><%= Math.round(unit.rating) %>%</div>
                    <div class="location"><%= unit.location %></div>
                    <div class="description"><%= unit.description %></div>
                </div>
            </a>
        <% } else if (type == 'services') { %>
            <a class="point" href="/<%= unit.point.profile.address %>">
                <div class="logo">
                    <img src="/img/testLogo.jpg" alt="" />
                </div>
                <div class="info">
                    <div class="name"><%= unit.point.name %></div>
                    <div class="rating"><%= Math.round(unit.point.rating) %>%</div>
                    <div class="location"><%= unit.point.location %></div>
                    <div class="service">
                        <div class="name"><%= unit.name %></div>
                        <div class="description"><%= unit.description %></div>
                        <div class="price">от <%= unit.price_from %> до <%= unit.price_to %> руб.</div>
                    </div>
                </div>
            </a>
        <% } else if (type == 'actions') { %>
            <a class="point" href="/<%= unit.point.profile.address %>">
                <div class="logo">
                    <img src="/img/testLogo.jpg" alt="" />
                </div>
                <div class="info">
                    <div class="name"><%= unit.point.name %></div>
                    <div class="rating"><%= Math.round(unit.point.rating) %>%</div>
                    <div class="location"><%= unit.point.location %></div>
                    <div class="action">
                        <div class="name"><%= unit.name %></div>
                        <div class="description"><%= unit.description %></div>
                    </div>
                </div>
            </a>
        <% } %>
    </script>
    <script type="text/template" id="searchSeparatorTemplate">
        <div class="separator"></div>
    </script>
    <script type="text/template" id="searchNotFoundTemplate">
        <div id="noResults">Не найдено ни одной точки по Вашему запросу</div>
    </script>
    <script type="text/template" id="searchLoadingTemplate">
        <% if (first) { %>
            <div id="loading" class="first">Идет загрузка...</div>
        <% } else { %>
            <div id="loading" class="noFirst">
                <div class="separator"></div>
                <div class="content">Идет загрузка...</div>
            </div>
        <% } %>
    </script>
    <script type="text/template" id="searchLoadTemplate">
        <div id="load">
            <div class="separator"></div>
            <div class="content">Загрузить ещё</div>
        </div>
    </script>
    <!-- [ /Search ] -->
    <!-- [ User ] -->
    <script type="text/template" id="subheaderUserTemplate">
        <div class="subheader forUser">
            <div class="logo">
                <img src="/img/testLogo.jpg" alt="" />
            </div>
            <div class="info">
                <div class="name"><%- user.name %></div>
                <div class="about"><%- user.about %></div>
            </div>
            <div class="statistics">
                <a class="block" href="/<%= user.profile ? user.profile.address : 'user' + user.id %>">
                    <div class="count"><%= user.postsCount %></div>
                    <div class="name">постов</div>
                </a>
                <a class="block" href="/<%= user.profile ? user.profile.address : 'user' + user.id %>/users">
                    <div class="count"><%= user.usersCount %></div>
                    <div class="name">интересных людей</div>
                </a>
                <a class="block" href="/<%= user.profile ? user.profile.address : 'user' + user.id %>/points">
                    <div class="count"><%= user.pointsCount %></div>
                    <div class="name">точек</div>
                </a>
                <a class="block" href="/<%= user.profile ? user.profile.address : 'user' + user.ids %>/followers">
                    <div class="count"><%= user.followersCount %></div>
                    <div class="name">подписчиков</div>
                </a>
            </div>
            <div class="options">
                <a href="/<%= user.profile ? user.profile.address : 'user' + user.id %>/edit">Редактировать</a>
            </div>
            <div class="menu">
                <a href="/<%= user.profile ? user.profile.address : 'user' + user.id %>" <%= (page == 'wall') ? 'class="active"' : '' %> data-id="wall">Записи<%= (user.postsCount != 0) ? '<span>' + user.postsCount + '</span>' : '' %></a>
            </div>
        </div>
        <div class="separator"></div>
        <div id="content">#content</div>
    </script>
    <script type="text/template" id="userWallTemplate">
        <form class="addPost">
            <textarea name="text"></textarea>
            <input type="submit" value="Добавить"> <span></span>
        </form>
        <div class="separator"></div>
        <div id="posts"></div>
    </script>
    <script type="text/template" id="userWallLoadingTemplate">
        <% if (first) { %>
            <div id="loading" class="first">Идет загрузка...</div>
        <% } else { %>
            <div id="loading" class="noFirst">
                <div class="separator"></div>
                <div class="content">Идет загрузка...</div>
            </div>
        <% } %>
    </script>
    <script type="text/template" id="userWallLoadTemplate">
        <div id="load">
            <div class="separator"></div>
            <div class="content">Загрузить ещё</div>
        </div>
    </script>
    <script type="text/template" id="userWallNotFoundTemplate">
        <div class="noPosts">Пока нет ни одной записи</div>
    </script>
    <script type="text/template" id="userWallSeparatorTemplate">
        <div class="separator"></div>
    </script>
    <script type="text/template" id="userWallPostTemplate">
        <div class="avatar">
            <img src="https://pbs.twimg.com/profile_images/572360620519878656/tMFYl1Re_400x400.jpeg" alt="" />
        </div>
        <div class="content">
            <div class="title">
                <span class="name"><%- post.user.name %></span>
                <span class="date"><%- moment(post.created_at).calendar().toLowerCase() %></span>
            </div>
            <div class="text"><%= post.text.replace(/</g, '&lt;').replace(/\n/g, '<br />') %></div>
        </div>
        <div class="editContent" style="display: none;">
            <textarea name="text"></textarea>
        </div>
        <div class="options">
            <a class="remove">
                <img src="/img/remove64.png" alt="" />
            </a>
            <a class="edit">
                <img src="/img/edit64.png" alt="" />
            </a>
            <a class="ok" style="display: none;">
                <img src="/img/ok64.png" alt="" />
            </a>
        </div>
    </script>
    <script type="text/template" id="userPointsTemplate">
        <div id="points"></div>
    </script>
    <script type="text/template" id="userPointsLoadingTemplate">
        <% if (first) { %>
            <div id="loading" class="first">Идет загрузка...</div>
        <% } else { %>
            <div id="loading" class="noFirst">
                <div class="separator"></div>
                <div class="content">Идет загрузка...</div>
            </div>
        <% } %>
    </script>
    <script type="text/template" id="userPointsLoadTemplate">
        <div id="load">
            <div class="separator"></div>
            <div class="content">Загрузить ещё</div>
        </div>
    </script>
    <script type="text/template" id="userPointsNotFoundTemplate">
        <div class="noPoints">Пока нет ни одной точки</div>
    </script>
    <script type="text/template" id="userPointsSeparatorTemplate">
        <div class="separator"></div>
    </script>
    <script type="text/template" id="userPointsOneTemplate">
        <a class="point" href="/<%= point.profile.address %>">
            <div class="logo">
                <img src="/img/testLogo.jpg" alt="" />
            </div>
            <div class="info">
                <div class="name"><%= point.name %></div>
                <div class="rating"><%= Math.round(point.rating) %>%</div>
                <div class="location"><%= point.location %></div>
                <div class="description"><%= point.description %></div>
                <!-- <div class="button">Отписаться</div> -->
            </div>
        </a>
    </script>
    <!-- [ /User ] -->
    <!-- [ Point ] -->
    <script type="text/template" id="subheaderPointTemplate">
        <div class="subheader forPoint">
            <div class="logo">
                <img src="/img/testLogo.jpg" alt="" />
            </div>
            <div class="info">
                <div class="name"><%- point.name %></div>
                <div class="rating"><%- Math.floor(point.rating) %>%</div>
                <div class="location"><%- point.location %></div>
                <div class="description"><%- point.description %></div>
            </div>
            <div class="subscribed" id="subscribedButton" style="<%- (point.userPivot && point.userPivot.subscribed == true) ? '' : 'display: none;' %>">
                <div>Вы подписаны</div>
                <a class="unsubscribe" id="unsubscribeButton">Отписаться</a>
            </div>
            <div class="subscription" id="subscribeButton" style="<%- (point.userPivot && point.userPivot.subscribed == true) ? 'display: none;' : '' %>">Подписаться</div>
            <div class="menu">
                <a href="/<%- point.profile.address %>" <%= (page == 'wall') ? 'class="active"' : '' %> data-id="wall">Записи<%= (point.postsCount == 0) ? '' : '<span>' + point.postsCount +'</span>' %></a>
                <a href="/<%- point.profile.address %>/services" <%= (page == 'services') ? 'class="active"' : '' %> data-id="services">Услуги</a>
                <a href="/<%- point.profile.address %>/information" <%= (page == 'information') ? 'class="active"' : '' %> data-id="information">Информация</a>
                <a href="/<%- point.profile.address %>/actions" <%= (page == 'actions') ? 'class="active"' : '' %> data-id="actions">Акции</a>
                <a href="/<%- point.profile.address %>/comments" <%= (page == 'comments') ? 'class="active"' : '' %> data-id="comments">Отзывы<%= (point.commentsCount == 0) ? '' : '<span>' + point.commentsCount +'</span>' %></a>
            </div>
        </div>
        <div class="separator"></div>
        <div id="content">#content</div>
    </script>
    <script type="text/template" id="pointWallTemplate">
        <form class="addPost">
            <textarea name="text"></textarea>
            <input type="submit" value="Добавить"> <span></span>
        </form>
        <div class="separator"></div>
        <div id="posts"></div>
    </script>
    <script type="text/template" id="pointWallLoadingTemplate">
        <% if (first) { %>
            <div id="loading" class="first">Идет загрузка...</div>
        <% } else { %>
            <div id="loading" class="noFirst">
                <div class="separator"></div>
                <div class="content">Идет загрузка...</div>
            </div>
        <% } %>
    </script>
    <script type="text/template" id="pointWallLoadTemplate">
        <div id="load">
            <div class="separator"></div>
            <div class="content">Загрузить ещё</div>
        </div>
    </script>
    <script type="text/template" id="pointWallNotFoundTemplate">
        <div class="noPosts">Пока нет ни одной записи</div>
    </script>
    <script type="text/template" id="pointWallSeparatorTemplate">
        <div class="separator"></div>
    </script>
    <script type="text/template" id="pointWallPostTemplate">
        <div class="avatar">
            <img src="https://pbs.twimg.com/profile_images/572360620519878656/tMFYl1Re_400x400.jpeg" alt="" />
        </div>
        <div class="content">
            <div class="title">
                <span class="name"><%- post.user.name %></span>
                <span class="date"><%- moment(post.created_at).calendar().toLowerCase() %></span>
            </div>
            <div class="text"><%= post.text.replace(/</g, '&lt;').replace(/\n/g, '<br />') %></div>
        </div>
        <div class="editContent" style="display: none;">
            <textarea name="text"></textarea>
        </div>
        <div class="options">
            <a class="remove">
                <img src="/img/remove64.png" alt="" />
            </a>
            <a class="edit">
                <img src="/img/edit64.png" alt="" />
            </a>
            <a class="ok" style="display: none;">
                <img src="/img/ok64.png" alt="" />
            </a>
        </div>
    </script>
    <script type="text/template" id="pointInformationTemplate">
        <div class="workdays">
            <div class="title">Рабочие дни</div>
            <ul>
                <li>Пн.<span>8:00 - 18:00</span></li>
                <li>Вт.<span>8:00 - 18:00</span></li>
                <li>Ср.<span>8:00 - 18:00</span></li>
                <li>Чт.<span>8:00 - 18:00</span></li>
                <li>Пт.<span>8:00 - 18:00</span></li>
                <li>Сб.<span>Выходной</span></li>
                <li>Вс.<span>Выходной</span></li>
            </ul>
        </div>
        <div class="internet">
            <div class="title">Интернет</div>
            <ul>
                <li>
                    <div class="image">
                        <img src="/img/vk128.png" alt="" />
                    </div>
                    <span>ВКонтакте</span>
                    <a href="http://vk.com/justdoit" target="_blank" class="right">vk.com/justdoit</a>
                </li>
                <li>
                    <div class="image">
                        <img src="/img/website96.png" alt="" />
                    </div>
                    <span>Веб-сайт</span>
                    <a href="http://google.com" target="_blank" class="right">google.com</a>
                </li>
            </ul>
        </div>
        <div class="contacts">
            <div class="title">Контакты</div>
            <ul>
                <li>
                    <div class="image">
                        <img src="/img/phone128.png" alt="" />
                    </div>
                    <span>Телефон</span>
                    <span class="right">8 (843) 262-22-22</span>
                </li>
                <li>
                    <div class="image">
                        <img src="/img/email128.png" alt="" />
                    </div>
                    <span>E-Mail</span>
                    <a href="mailto://atom-danil@yandex.ru" class="right">atom-danil@yandex.ru</a>
                </li>
            </ul>
        </div>
        <div class="map" style="display: none;">
            <div class="separator"></div>
            <div id="mapCanvas" style="width: 100%; height: 400px;"></div>
        </div>
    </script>
    <script type="text/template" id="pointServicesTemplate">
        <% if (servicesSections.length == 0) { %>
            <div class="noSections">Пока нет ни одной услуги</div>
        <% } else { %>
            <ul class="sections">
                <% _(servicesSections).each(function(section, index) { %>
                    <li class="section <%= (index == 0) ? 'active' : '' %>" data-id="<%- section.id %>"><%- section.name %></li>
                <% }); %>
            </ul>
            <% _(servicesSections).each(function(section, index) { %>
                <ul class="services" id="servicesOfSection<%- section.id %>" <%= (index != 0) ? 'style="display: none;"' : '' %>>
                    <% _(section.services).each(function(service) { %>
                        <li><%- service.name %><span>от <%- Math.round(service.price_from * 100) / 100 %> до <%- Math.round(service.price_to * 100) / 100 %> руб.</span></li>
                    <% }); %>
                </ul>
            <% }); %>
        <% } %>
    </script>
    <script type="text/template" id="pointCommentsTemplate">
        <form class="addComment">
            <textarea name="text"></textarea>
            <input type="submit" value="Добавить"> <span></span>
        </form>
        <div class="separator"></div>
        <div id="comments"></div>
    </script>
    <script type="text/template" id="pointCommentsLoadingTemplate">
        <% if (first) { %>
            <div id="loading" class="first">Идет загрузка...</div>
        <% } else { %>
            <div id="loading" class="noFirst">
                <div class="separator"></div>
                <div class="content">Идет загрузка...</div>
            </div>
        <% } %>
    </script>
    <script type="text/template" id="pointCommentsLoadTemplate">
        <div id="load">
            <div class="separator"></div>
            <div class="content">Загрузить ещё</div>
        </div>
    </script>
    <script type="text/template" id="pointCommentsNotFoundTemplate">
        <div class="noComments">Пока нет ни одного комментария</div>
    </script>
    <script type="text/template" id="pointCommentsSeparatorTemplate">
        <div class="separator"></div>
    </script>
    <script type="text/template" id="pointCommentsOneTemplate">
        <div class="avatar">
            <img src="https://pbs.twimg.com/profile_images/572360620519878656/tMFYl1Re_400x400.jpeg" alt="" />
        </div>
        <div class="content">
            <div class="title">
                <span class="name"><%- comment.user.name %></span>
                <span class="date"><%- moment(comment.created_at).calendar().toLowerCase() %></span>
            </div>
            <div class="text"><%= comment.text.replace(/</g, '&lt;').replace(/\n/g, '<br />') %></div>
        </div>
        <div class="editContent" style="display: none;">
            <textarea name="text"></textarea>
        </div>
        <div class="options">
            <a class="remove">
                <img src="/img/remove64.png" alt="" />
            </a>
            <a class="edit">
                <img src="/img/edit64.png" alt="" />
            </a>
            <a class="ok" style="display: none;">
                <img src="/img/ok64.png" alt="" />
            </a>
        </div>
    </script>
    <script type="text/template" id="pointActionsTemplate">
        <form class="addAction">
            <textarea name="text"></textarea>
            <input type="submit" value="Добавить"> <span></span>
        </form>
        <div class="separator"></div>
        <div id="actions"></div>
    </script>
    <script type="text/template" id="pointActionsLoadingTemplate">
        <% if (first) { %>
            <div id="loading" class="first">Идет загрузка...</div>
        <% } else { %>
            <div id="loading" class="noFirst">
                <div class="separator"></div>
                <div class="content">Идет загрузка...</div>
            </div>
        <% } %>
    </script>
    <script type="text/template" id="pointActionsLoadTemplate">
        <div id="load">
            <div class="separator"></div>
            <div class="content">Загрузить ещё</div>
        </div>
    </script>
    <script type="text/template" id="pointActionsNotFoundTemplate">
        <div class="noActions">Пока нет ни одной акции</div>
    </script>
    <script type="text/template" id="pointActionsSeparatorTemplate">
        <div class="separator"></div>
    </script>
    <script type="text/template" id="pointActionsOneTemplate">
        <form class="action" id="action<%- action.id %>">
            <div class="avatar">
                <img src="https://pbs.twimg.com/profile_images/572360620519878656/tMFYl1Re_400x400.jpeg" alt="" />
            </div>
            <div class="content">
                <div class="title">
                    <span class="name"><%- action.name %></span>
                    <span class="date"><%- moment(action.created_at).calendar().toLowerCase() %></span>
                </div>
                <div class="text"><%- action.description %></div>
                <textarea name="text"></textarea>
                <div class="editLoader">Сохраняем...</div>
            </div>
        </form>
    </script>
    <!-- [ /Point ] -->
    <div id="header">
        <div class="wrapper" style="width: 1000px;">123</div>
    </div>
    <div id="middle">
        <div class="wrapper" style="width: 1000px;">123</div>
    </div>
    <div id="footer">
        <div class="wrapper" style="width: 1000px;">123</div>
    </div>
    <div class="modal" id="authorizeModal"></div>
</body>
</html>