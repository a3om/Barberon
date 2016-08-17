var barberon =
{
    //
};

barberon.scroller = (function()
{
    var lastPosition = 0;
    var lastScrollPosition = 0;
    var going = false;
    var descriptionScroll = 0;

    var initialize = function()
    {
        $('#scroll').click(function()
        {
            if (going)
            {
                return false;
            }

            if (lastScrollPosition == 0)
            {
                going = true;

                $({deg: 360}).animate({deg: 180},
                {
                    duration: 400,

                    step: function(now)
                    {
                        $('#scroll .arrow').css('transform', 'rotate(' + now + 'deg)');
                    }
                });

                descriptionScroll = 0;

                $('html, body').animate({scrollTop : 0}, 400, function()
                {
                    console.log('Закончили перемещение');
                });

                lastScrollPosition = $(window).scrollTop();
            }
            else
            {
                going = true;
                
                $({deg: 180}).animate({deg: 360},
                {
                    duration: 400,

                    step: function(deg)
                    {
                        $('#scroll .arrow').css('transform', 'rotate(' + deg + 'deg)');
                    }
                });

                descriptionScroll = lastScrollPosition;

                $('html, body').animate({scrollTop : lastPosition}, 400, function()
                {
                    going = false;
                });

                lastScrollPosition = 0;
            }
        });
    };

    var updateState = function(scrollPosition)
    {
        if (going)
        {
            if (descriptionScroll != scrollPosition)
            {
                return;
            }

            going = false;
            return;
        }

        if (scrollPosition > 100)
        {
            $('#scroll').show();
            $('#scroll .arrow').css('transform', 'rotate(0deg)');
            lastScrollPosition = 0;
        }
        else
        {
            $('#scroll').hide();
            console.log('Переместились вверх');
        }

        lastPosition = scrollPosition;
    };

    var up = function()
    {
        console.log('To up');
        $('#scroll').show().css('transform', 'rotate(0deg)');
    };

    var down = function()
    {
        console.log('To down');
        $('#scroll').show().css('transform', 'rotate(180deg)');
    };
    
    return {

        initialize: initialize,
        updateState: updateState,
        up: up,
        down: down,
    };
})();

barberon.loader = (function(options)
{
    var ajax = null;
    var units = [];
    var hadUnitsYet = true;

    var searchParams =
    {
        searchBy: '',
        orderBy: '',
        order: '',
        query: '',
        priceFrom: 50,
        priceTo: 5000,
    };

    var isLoading = function()
    {
        return ajax !== null;
    };

    var hasUnitsYet = function()
    {
        return hadUnitsYet;
    };

    var setUnitsYet = function(had)
    {
        hadUnitsYet = had;
    };

    var stop = function()
    {
        ajax.abort();
        ajax = null;
    };

    var updateUrl = function()
    {
        var params = {};

        if (searchParams.searchBy)
        {
            params.searchBy = searchParams.searchBy;
        }

        if (searchParams.query)
        {
            params.query = searchParams.query;
        }

        if (searchParams.orderBy)
        {
            params.orderBy = searchParams.orderBy;
        }

        if (searchParams.order)
        {
            params.order = searchParams.order;
        }

        if (searchParams.priceFrom && searchParams.searchBy == 'services')
        {
            params.priceFrom = searchParams.priceFrom;
        }

        if (searchParams.priceTo && searchParams.searchBy == 'services')
        {
            params.priceTo = searchParams.priceTo;
        }

        if (units.length)
        {
            params.count = units.length;
        }

        window.history.replaceState({}, 'Title', (params.length == 0) ? '' : '/?' + $.param(params));
    };

    var load = function()
    {
        if (isLoading())
        {
            stop();
        }

        options.start();

        ajax = $.ajax(
        {
            url: '/getUnits',
            method: 'post',

            data:
            {

                'searchBy': searchParams.searchBy,
                'query': searchParams.query,
                'orderBy': searchParams.orderBy,
                'order': searchParams.order,
                'priceFrom': searchParams.priceFrom,
                'priceTo': searchParams.priceTo,
                'start': units.length,
                'count': 10,
            },
        })
        .done(function(data)
        {
            ajax = null;

            if (!data.success)
            {
                console.error(data);
                return;
            }

            var newUnits = [];

            for (var i = 0; i < data.units.length; ++i)
            {
                if (units.indexOf(data.units[i].id) > -1)
                {
                    continue;
                }

                newUnits.push(data.units[i]);
            }

            for (var i = 0; i < newUnits.length; ++i)
            {
                units.push(newUnits[i].id);
            }

            updateUrl();
            options.done(units, newUnits, searchParams.searchBy);

            hadUnitsYet = (data.units.length == 10);
        });
    };

    var setUnits = function(preloadedUnits)
    {
        units = preloadedUnits;
    };

    var setSearchParams = function(preloadedSearchParams)
    {
        searchParams = preloadedSearchParams;
    };

    var setSearchParam = function(param, value)
    {
        searchParams[param] = value;
    };

    var clear = function()
    {
        if (isLoading())
        {
            stop();
        }

        units = [];
        hasUnitsYet = true;
        options.clear();
    };

    return {

        load: load,
        isLoading: isLoading,
        hasUnitsYet: hasUnitsYet,
        setUnits: setUnits,
        setSearchParams: setSearchParams,
        setSearchParam: setSearchParam,
        updateUrl: updateUrl,
        setUnitsYet: setUnitsYet,
        clear: clear,
    };
})
({
    start: function()
    {
        $('#loading').removeClass('button').unbind('click').text('Загрузка...');
        // $('#loading').remove();
        $('#searchLoader').show();
    },

    done: function(totalUnits, newUnits, searchBy)
    {
        $('#loading').remove();
        $('#searchLoader').hide();

        if (newUnits.length == 0)
        {
            if (totalUnits.length != 0)
            {
                return;
            }

            $('<div id="noResults">Не найдено ни одного салона</div>').appendTo('#content');
            return;
        }

        if (totalUnits.length > newUnits.length)
        {
            $('#content').append('<div class="separator"></div>');
        }

        for (var i = 0, a = 0; i < newUnits.length; ++i)
        {
            if (a != 0)
            {
                $('#content').append('<div class="separator"></div>');
            }

            switch (searchBy)
            {
                case 'points':
                {
                    $('#content').append('<a class="point" href="http://' + barberon.domain + '/' + newUnits[i].address + '"><div class="logo"><img src="/img/testLogo.jpg" alt="" /></div><div class="info"><div class="name">' + newUnits[i].name + '</div><div class="rating">' + Math.round(newUnits[i].rating, 0) + '%</div><div class="location">' + newUnits[i].location + '</div><div class="description">' + newUnits[i].description + '</div></div></a>');
                    break;
                }
                case 'services':
                {
                    $('#content').append('<a class="point" href="http://' + barberon.domain + '/' + newUnits[i].point.address + '"><div class="logo"><img src="/img/testLogo.jpg" alt="" /></div><div class="info"><div class="name">' + newUnits[i].point.name + '</div><div class="rating">' + Math.round(newUnits[i].point.rating, 0) + '%</div><div class="location">' + newUnits[i].point.location + '</div><div class="service"><div class="name">' + newUnits[i].name + '</div><div class="description">' + newUnits[i].description + '</div><div class="price">от ' + Math.round(newUnits[i].price_from, 0) + ' до ' + Math.round(newUnits[i].price_to, 0) + ' руб.</div></div></div></a>');
                    break;
                }
                case 'actions':
                {
                    $('#content').append(':P');
                    break;
                }
            }

            ++a;
        }

        if (newUnits.length >= 10)
        {
            $('<div id="loading">Загрузить ещё</div>')
                .appendTo('#content')

                .click(function()
                {

                    if (!barberon.loader.isLoading()) {

                        barberon.loader.load();
                    }
                })

                .addClass('button');
        }
    },

    clear: function()
    {
        $('#content').html('');
    },
});

barberon.modal = (function()
{
    var shownName = null;

    var isShown = function()
    {
        return shownName !== null;
    };

    var hide = function()
    {
        if (!isShown)
        {
            return;
        }

        $('#' + shownName + 'Modal').hide();
        $('body').removeClass('nonScrollable');
        shownName = null;
    };

    var show = function(name)
    {
        if (isShown()) {

            if (shownName == name)
            {
                return;
            }

            hide();
            return;
        }

        $('#' + name + 'Modal').show();
        $('body').addClass('nonScrollable');
        shownName = name;
    };

    return {

        show: show,
        isShown: isShown,
        hide: hide,
    };
})();

barberon.recalculateWidth = function()
{
    var $body = $('body'), $wrapper = $('.wrapper');
    var bodyWidth = $body.css('overflow', 'hidden').width();
    var wrapperWidth = $wrapper.width();
    $wrapper.css('margin-left', (bodyWidth - wrapperWidth) / 2);
    $body.css('overflow', '');
};

barberon.showServicesOfSection = function(element, sectionId)
{
    $('#content .sections li').removeClass('active');
    $(element).addClass('active');
    $('#content .services').hide();
    $('#servicesOfSection' + sectionId).show();
};

barberon.editingComment = 0;

barberon.saveComment = function()
{
    var id = barberon.editingComment;
    $comment = $('#comment' + id);
    barberon.editingComment = 0;
    $comment.find('.editLoader').removeClass('error success').text('Идет сохранение...').fadeIn('fast');

    $.ajax(
    {
        url : '/editComment?id=' + id,
        method: 'POST',
        data: $comment.serialize(),
    })
    .done(function(data)
    {
        if (!data.success)
        {
            console.log(data);

            $comment.find('.editLoader').addClass('error').fadeOut('fast', function()
            {
                $(this).text('К сожалению, произошла ошибка, попробуйте повторить позднее').fadeIn('fast');
            });

            return;
        }

        $comment.find('.text').text($comment.find('textarea').val()).show();
        $comment.find('textarea').val('').fadeOut('fast');
        $comment.find('.editLoader').fadeOut('fast');
    });
};

$.getScrollPercentage = function()
{
    return ($(document).height() - $(window).height() - $(window).scrollTop()) / $(window).height();
}

$(function()
{
    if (document.referrer)
    {

        $('#backButton').show().click(function() {

            history.back();
        });
    }

    $('.modal .overlay').click(function(e)
    {
        // console.log('overlay');
        barberon.modal.hide();
        // return false;
    });
    
    $('#editProfileButton').click(function()
    {
        location.href = '/' + barberon.userAddress + '/edit';
        return false;
    });

    $('textarea').autoResize({extraSpace: 0});

    // $('.subscribedButton').click(function()
    // {
    //     $('.sub')
    // });

    $('.editComment').click(function(e)
    {
        if (barberon.editingComment != 0)
        {
            barberon.saveComment();
            return false;
        }

        var id = $(this).attr('data-id');
        $comment = $('#comment' + id);
        
        $comment.find('textarea').val($comment.find('.text').text()).click(function()
        {
            return false;
        })
        .show();
        
        $comment.find('.text').hide();
        barberon.editingComment = id;
        return false;
    });

    $('.deleteComment').click(function(e)
    {
        var id = $(this).attr('data-id');
        $(this).text('Идет удаление...');
        $comment = $('#comment' + id);

         $.ajax(
        {
            url : '/deleteComment?id=' + id,
            method: 'POST',
        })
        .done(function(data)
        {
            if (!data.success)
            {
                console.log(data);
                return;
            }

            ($comment.prev().length == 0) ? $comment.next().hide : $comment.prev().hide();
            $comment.hide();
        });
        
        return false;
    });

    $(document).click(function()
    {
        if ($('#header .menu').is(':visible'))
        {
            $('#header .menu').removeClass('active');
            $('#header .profile').removeClass('clicked');
        }

        if (barberon.editingComment != 0)
        {
            barberon.saveComment();
        }
    });

    $(window).resize(function()
    {
        barberon.recalculateWidth();
    });

    barberon.recalculateWidth();

    if (barberon.location[0] == 'index')
    {
        barberon.scroller.initialize();

        $('#loading').click(function()
        {    
            if (!barberon.loader.isLoading())
            {
                barberon.loader.load();
            }
        });

        $('#searchForm').submit(function()
        {
            barberon.loader.setSearchParam('query', $('#query').val());
            barberon.loader.updateUrl();
            barberon.loader.clear();
            barberon.loader.load();
            return false;
        });

        $('.dropdown li').click(function()
        {

            var searchBy = ['points', 'services', 'actions'];
            var searchByLang = ['точкам', 'услугам', 'акциям'];
            var searchByPlaceholder = ['Введите название, адрес или ключевое слово точки', 'Введите название или часть описания услуги', 'Введите название акции'];
            var index = $(this).index();
            $('#searchBy').val(searchBy[index]);
            $('#searchByTitle').text('Поиск по ' + searchByLang[index]);
            $('#something').attr('placeholder', searchByPlaceholder[index])
            $('.dropdown').removeClass('clicked').find('ul').removeClass('active');

            if (searchBy[index] == 'services') {

                $('#servicesPriceFilter').show();
            }
            else {

                $('#servicesPriceFilter').hide();
            }

            barberon.loader.setSearchParam('searchBy', searchBy[index]);
            barberon.loader.updateUrl();
            barberon.loader.clear();
            barberon.loader.load();
            return false;
        });

        $('.dropdown').click(function()
        {

            $(this).addClass('clicked').find('ul').addClass('active');
            return false;
        });

        $(document).click(function()
        {

            if ($('.dropdown ul').is(':visible')) {

                $('.dropdown').removeClass('clicked').find('ul').removeClass('active');
            }

            if ($('.sorter ul').is(':visible')) {

                $('.sorter').removeClass('clicked').find('ul').removeClass('active');
            }
        });

        $(window).scroll(function()
        {

            var $header = $('#header'), $sidebar = $('#sidebar'), $topbar = $('#topbar');
            barberon.scroller.updateState($(window).scrollTop());

            if ($(window).scrollTop() < $header.height()) {

                $sidebar.css('position', 'absolute');
                $sidebar.css('top', $header.height());
                $topbar.css('position', 'absolute');
                $topbar.css('top', $header.height());
            }
            else {

                $sidebar.css('position', 'fixed');
                $sidebar.css('top', 0);
                $topbar.css('position', 'fixed');
                $topbar.css('top', 0);
            }

            console.log($.getScrollPercentage());

            if ($.getScrollPercentage() < 1.0) {

                if (!barberon.loader.isLoading() && barberon.loader.hasUnitsYet()) {

                    barberon.loader.load();
                }
            }
        });

        $("#slider-range").slider(
        {

            range: true,
            min: 50,
            max: 5000,
            step: 25,
            values: [50, 5000],

            slide: function(event, ui) {

                $('#filterPriceFrom').val(ui.values[0]);
                $('#filterPriceTo').val(ui.values[1]);
            },

            change: function(event, ui) {

                barberon.loader.setSearchParam('priceFrom', ui.values[0]);
                barberon.loader.setSearchParam('priceTo', ui.values[1]);
                barberon.loader.updateUrl();
                barberon.loader.clear();
                barberon.loader.load();
            },
        });

        $('#filterPriceFrom').keyup(function()
        {

            var value = $(this).val();
            var values = $('#slider-range').slider('option', 'values');

            if (!$.isNumeric(value) || value < 0 || value >= values[1]) {

                return;
            }

            $('#slider-range').slider({

                values: [value, values[1]]
            });

            barberon.loader.setSearchParam('priceFrom', value);
            barberon.loader.updateUrl();
            barberon.loader.clear();
            barberon.loader.load();
        });

        $('#filterPriceTo').keyup(function()
        {

            var value = $(this).val();
            var values = $('#slider-range').slider('option', 'values');

            if (!$.isNumeric(value) || value > 5000 || value <= values[0]) {

                return;
            }

            $('#slider-range').slider({

                values: [values[0], value]
            });

            barberon.loader.setSearchParam('priceTo', value);
            barberon.loader.updateUrl();
            barberon.loader.clear();
            barberon.loader.load();
        });

        $('.sorter li').click(function()
        {

            var orderBy = ['rating', 'distance'];
            // var searchByLang = ['точкам', 'услугам', 'акциям'];
            // var searchByPlaceholder = ['Введите название, адрес или ключевое слово точки', 'Введите название или часть описания услуги', 'Введите название акции'];
            var index = $(this).index();
            // $('#searchBy').val(searchBy[index]);
            // $('#searchByTitle').text('Поиск по ' + searchByLang[index]);
            // $('#something').attr('placeholder', searchByPlaceholder[index])
            $('.sorter').removeClass('clicked').find('ul').removeClass('active');
            $('#sortingByTitle').text($(this).text());
            barberon.loader.setSearchParam('orderBy', orderBy[index]);
            barberon.loader.updateUrl();
            barberon.loader.clear();
            barberon.loader.load();
            return false;
        });

        $('.sorter .title').click(function()
        {

            $('.sorter').addClass('clicked').find('ul').addClass('active');
            return false;
        });

        $('.sorter .order').click(function()
        {

            if ($(this).html() == '↓') {

                $(this).html('&uarr;');
                barberon.loader.setSearchParam('order', 'asc');
            }
            else {

                $(this).html('&darr;');
                barberon.loader.setSearchParam('order', 'desc');
            }

            barberon.loader.updateUrl();
            barberon.loader.clear();
            barberon.loader.load();
            return false;
        });
    }

    if (barberon.location[0] == 'user' && barberon.location[1] == 'edit')
    {
        $('#editProfileInformationForm').submit(function()
        {
            $('#saveLoader').removeClass('error success').text('Идет сохранение...').fadeIn('fast');
            $('#editProfileInformationForm .submit input').attr('disabled', 'disabled');
            // $('');

            $.ajax(
            {
                type: 'POST',
                url: '/' + barberon.userAddress + '/edit',
                data: $(this).serialize(),
            })
            .done(function(data)
            {
                data = (typeof data === 'object') ? data : {};
                data.errors = data.errors || {};

                ['name', 'about', 'email', 'oldPassword', 'newPassword', 'confirmationOfNewPassword'].forEach(function(field)
                {
                    if (!data.errors[field])
                    {
                        $('#editProfileInformationForm input[name=\'' + field + '\']').parent().removeClass('error').find('.error').text('').hide('slow');
                        return;
                    }

                    $('#editProfileInformationForm input[name=\'' + field + '\']').parent().addClass('error').find('.error').text(data.errors[field][0]).show('slow');
                });

                $('#editProfileInformationForm .submit input').removeAttr('disabled');

                if (!data.success)
                {
                    console.log(data);

                    if (!data.errors)
                    {
                        $('#saveLoader').addClass('error').fadeOut('fast', function()
                        {
                            $(this).text('К сожалению, произошла ошибка, попробуйте повторить позднее').fadeIn('fast');
                        });
                    }
                    else
                    {
                        $('#saveLoader').text('').fadeOut();
                    }
                    
                    return;
                }

                $('#saveLoader').addClass('success').fadeOut('fast', function()
                {
                    $(this).text('Данные были успешно сохранены!').fadeIn('fast');
                });
            });

            return false;
        });
    }

    if (barberon.location[0] == 'point')
    {
        $('#subscribedButton').click(function()
        {
            $(this).addClass('clicked');
            return false;
        });

        $(document).click(function()
        {
            $('#subscribedButton').removeClass('clicked');
        });

        $('#unsubscribeButton').click(function()
        {
            $.ajax(
            {
                type: 'POST',
                url: '/' + barberon.point.address + '/unsubscribe',
            })
            .done(function(data)
            {
                if (!data.success)
                {
                    console.log(data);
                    return;
                }

                $('#subscribedButton').hide();
                $('#subscribeButton').show();
                $('#subscribedPointsCount').text(data.subscribedPointsCount);
            });
        });

        $('#subscribeButton').click(function()
        {
            $.ajax(
            {
                type: 'POST',
                url: '/' + barberon.point.address + '/subscribe',
            })
            .done(function(data)
            {
                if (!data.success)
                {
                    console.log(data);
                    return;
                }

                $('#subscribeButton').hide();
                $('#subscribedButton').show();
                $('#subscribedPointsCount').text(data.subscribedPointsCount);
            });
        });

        if (barberon.location[1] == 'comments')
        {
            $('#addCommentForm').submit(function()
            {
                $('#addCommentForm span').removeClass('error success').text('Идет добавление...').fadeIn('fast');
                $('#addCommentForm input').attr('disabled', 'disabled');

                $.ajax(
                {
                    type: 'POST',
                    url: '/' + barberon.point.address + '/comments/add',
                    data: $(this).serialize(),
                })
                .done(function(data)
                {
                    $('#addCommentForm input').removeAttr('disabled');

                    if (!data.success)
                    {
                        console.log(data);

                        $('#addCommentForm span').addClass('error').fadeOut('fast', function()
                        {
                            $(this).text(data.error || 'К сожалению, произошла ошибка, попробуйте повторить позднее').fadeIn('fast');
                        });
                        
                        return;
                    }

                    $('#addCommentForm span').addClass('success').fadeOut('fast', function()
                    {
                        $('#addCommentForm textarea').val('');

                        $(this).text('Комментарий был успешно добавлен!').fadeIn('fast', function()
                        {
                            location.reload();
                        });
                    });
                });

                return false;
            });
        }
    }
});