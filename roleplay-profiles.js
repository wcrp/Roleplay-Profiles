var __RolePlayProfiles_Profiles
$(document).ready(function () {

    var Profiles
    var MessageKey = "roleplay_message"
    var ProfileKey = "roleplay_profiles"


    //Get the profiles
    if (pb.plugin.key(ProfileKey).get()) {

        Profiles = JSON.parse(pb.plugin.key(ProfileKey).get())
        if (Profiles.internal === true) {
            Profiles = JSON.parse(localStorage.getItem("RolePlayProfiles"))
            if (!Profiles) {
                Profiles = {}
            }
        }
        for (var i in Profiles) {
            if (typeof Profiles[i] === 'string') {
                var avatar = Profiles[i]
                Profiles[i] = {}
                Profiles[i].avatar = avatar
            } else {
                Profiles[escapeHtml(i)] = Profiles[i]
                if (!(escapeHtml(i) === i))
                    delete Profiles[i]
            }
        }
    } else {
        Profiles = {}
    }
    __RolePlayProfiles_Profiles = Profiles

    var BoardId = yootil.page.thread.board_id()
    var AllowedBoard = false
    var BoardList = pb.plugin.get('roleplay_profiles').settings.enabled_boards
    for (var i in BoardList) {
        if (BoardList[i] == BoardId)
            AllowedBoard = true
    }
    BoardList = pb.plugin.get('roleplay_profiles').settings.manual_board_id
    for (var i in BoardList) {
        if (BoardList[i].board_id == BoardId)
            AllowedBoard = true
    }
    //if (BoardId==50 || BoardId==51) AllowedBoard=true //WCRP Drafts


    //Select all posts on page
    if (AllowedBoard) {
        pb.events.on("pageChange", DoMiniProfileChange)
        DoMiniProfileChange()
    }
    function DoMiniProfileChange() {
        $(".roleplay-alt").remove()
        if ($(".mini-profile").length > 0)
            $('tr[id^="post-"]').each(function (i, e) {

                var PostId = $(e).attr("id").split("-")[1]
                var MessageJson = pb.plugin.key(MessageKey).get(Number(PostId))
                if (MessageJson) {
                    var MessageData = JSON.parse(MessageJson)
                    var AvatarUrl = escapeHtml(MessageData.avatar)
                    var Name = escapeHtml(unescapeHtml(MessageData.name))
                    var Rank = MessageData.rank

                    if (!Rank)
                        Rank = ""
                    else
                        Rank = "<br>" + escapeHtml(Rank)
                    var mp = $(".mini-profile", e)
                    var classList = mp[0].classList.value
                    if (!classList)
                        classList = mp[0].classList.toString()
                    var userId = classList.split("user-")[1].split(" ")[0]
                    var UserName = escapeHtml($(".js-user-link", mp)[0].innerText)
                    mp.hide()
                    mp.parent().append(`
						<div class="mini-profile user-`+ userId + ` roleplay-alt">
                            <span style="">
                                <a class="o-user-link js-user-link alt-user-link user-link user-`+ userId + `" title="` + UserName + `" data-id="` + userId + `" href="/user/` + userId + `">` + Name + `</a>
                            </span>
                            `+ Rank + `
                            <div class="avatar" style="margin-top: 5px;">
                                <div class="avatar-wrapper avatar_size_default avatar-`+ userId + `"><img src="` + AvatarUrl + `" alt="RolePlay Avatar"></div>
                            </div>
							<br>
							<span class="personal-text user-`+ userId + ` alt-italics">roleplay profile of ` + UserName + `</span>
						</div>
                    `)
                }

            });
    }
    /*
    <span style="color: #000000;">
    	a class="o-user-link js-user-link user-link user-831 group-31" data-id="831" href="/user/831">Penguin</a>
    </span>
    */
    /*
    <div class="avatar" style="margin-top: 5px;">
		<div class="avatar-wrapper avatar_size_default avatar-831"><img src="https://i.imgur.com/4WEeLP7.png" alt="Penguin Avatar"></div>
    </div>
    */

    var CurrentLocation = location.pathname.split("/");
    if ((CurrentLocation.length >= 3) && (CurrentLocation[1] == "user") && (CurrentLocation[2] == yootil.user.id())) {

        if (CurrentLocation[3] == "roleplay") {
            yootil.create.profile_tab("Roleplay Profiles", "roleplay", true);
            //Make the page for the roleplay thing
            $(".form_user_status table #center-column").parent()[0].innerHTML = `
				<td id="center-column">
					<div class="content-box center-col">
						<select id="roleplay_profile_edit">
							
						</select><a class="button" href="#" id="roleplay_delete">Delete</a>
						<div id="roleplay_profile_display">
							<label for="roleplay_name">Name:</label><br><input type="text" name="roleplay_name" id="roleplay_name"><br>
							<label for="roleplay_avatar">Avatar url:</label><br><input type="text" name="roleplay_avatar" id="roleplay_avatar"><br>
							<label for="roleplay_rank">Rank/Role:</label><br><input type="text" name="roleplay_rank" id="roleplay_rank">
						</div>
						<br>
						<a class="button" href="#" id="roleplay_save" role="button">Save</a>
						<a class="button" href="#" id="roleplay_new" role="button">New</a>
						<a class="button" href="#" id="roleplay_fix" role="button">Fix This Felix</a>
					</div>
				</td>
			`
            UpdateSelectBox()
            $("#roleplay_profile_edit").on("change", function () {
                $("#roleplay_name").val(unescapeHtml($("#roleplay_profile_edit").val()))
                $("#roleplay_avatar").val(Profiles[escapeHtml($("#roleplay_profile_edit").val())].avatar)
                $("#roleplay_rank").val(Profiles[escapeHtml($("#roleplay_profile_edit").val())].rank)
            })
            $("#roleplay_delete").on("click", function (e) {
                e.preventDefault()
                delete Profiles[escapeHtml($("#roleplay_profile_edit").val())]
                SaveProfiles()
            })
            $("#roleplay_save").on("click", function (e) {
                e.preventDefault()
                if (!($("#roleplay_profile_edit").val() == "Please Select One To Modify")) {
                    delete Profiles[escapeHtml($("#roleplay_profile_edit").val())]
                    Profiles[escapeHtml($("#roleplay_name").val())] = {}
                    Profiles[escapeHtml($("#roleplay_name").val())].avatar = $("#roleplay_avatar").val()
                    Profiles[escapeHtml($("#roleplay_name").val())].rank = $("#roleplay_rank").val()
                    SaveProfiles()
                    $("#roleplay_profile_edit").val($("#roleplay_name").val())
                }
            })
            $("#roleplay_new").on("click", function (e) {
                e.preventDefault()
                Profiles[escapeHtml($("#roleplay_name").val())] = {}
                Profiles[escapeHtml($("#roleplay_name").val())].avatar = $("#roleplay_avatar").val()
                Profiles[escapeHtml($("#roleplay_name").val())].rank = $("#roleplay_rank").val()
                SaveProfiles()
                $("#roleplay_profile_edit").val($("#roleplay_name").val())
            })
            $("#roleplay_fix").on("click", function (e) {
                e.preventDefault()
                pb.window.alert("Send this to Felix", pb.plugin.key(ProfileKey).get())
            })


        } else {
            yootil.create.profile_tab("Roleplay Profiles", "roleplay");
        }
    }

    if (AllowedBoard) {
        //On a reply or not
        var OnAReply = 0
        OnAReply += $(".form_post_quick_reply").length
        OnAReply += $(".form_post_new").length


        if (Object.keys(Profiles).length > 0) {
            //Quick post
            $(".form_post_quick_reply").append(`<select id="roleplay_profile_edit" class="roleplay_quick_post"></select>`)
            $(".form_post_quick_reply [style^='clear']").remove()

            //Full post
            $(".wysiwyg-tabs").append(`<div class="roleplay_full_post"><select id="roleplay_profile_edit" class=""></select></div>`)
            //$(".form_post_new .editor [style^='clear']").remove()
        }

        if (OnAReply > 0) {
            UpdateSelectBox("Select which profile to use")
            $("#roleplay_profile_edit").on("change", function () {
                var o = JSON.stringify({
                    name: escapeHtml($("#roleplay_profile_edit").val()),
                    avatar: Profiles[escapeHtml($("#roleplay_profile_edit").val())].avatar,
                    rank: Profiles[escapeHtml($("#roleplay_profile_edit").val())].rank
                });
                pb.plugin.key(MessageKey).set_on("post_new", o)
                pb.plugin.key(MessageKey).set_on("post_quick_reply", o)
            })
        }
    }

    function UpdateSelectBox(defaultOption) {
        var d = defaultOption || "Please Select One To Modify"
        var s = $("#roleplay_profile_edit")[0]
        s.innerHTML = `<option selected disabled>` + d + `</option>`
        for (var i in Profiles) {
            s.innerHTML = s.innerHTML + "<option>" + i + "</option>"
        }
    }
    function SaveProfiles() {
        console.log("Saving to key...")
        pb.plugin.key(ProfileKey).set({
            value: JSON.stringify(Profiles),
            error: function (error) {
                console.log("Error saving to key")
                if (error.code == 16) {
                    console.log("Too big, saving to localStorage")
                    console.log(Profiles)
                    localStorage.setItem("RolePlayProfiles", JSON.stringify(Profiles))
                    pb.plugin.key(ProfileKey).set({ value: JSON.stringify({ internal: true }) })
                    return true
                }
                return false
            }
        })
        UpdateSelectBox()
    }

    function escapeHtml(text) {
        if (!text) return text
        if (!(typeof text === 'string')) return text
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
    function unescapeHtml(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

})