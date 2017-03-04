.class public Lcom/avtobiografia/rimichka/RimichkaActivity;
.super Landroid/app/Activity;
.source "RimichkaActivity.java"


# direct methods
.method public constructor <init>()V
    .locals 0

    .prologue
    .line 6
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    return-void
.end method


# virtual methods
.method public onCreate(Landroid/os/Bundle;)V
    .locals 1
    .param p1, "savedInstanceState"    # Landroid/os/Bundle;

    .prologue
    .line 10
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    .line 11
    const/high16 v0, 0x7f030000

    invoke-virtual {p0, v0}, Lcom/avtobiografia/rimichka/RimichkaActivity;->setContentView(I)V

    .line 12
    return-void
.end method
